"""Train a Growing Neural Cellular Automaton (Mordvintsev et al., Distill 2020)
and export its weights as JSON for the WebGL2 inference shader in src/sims/nca.js.

    uv run --python nca/.venv/bin/python nca/train.py --iters 4000

Conventions shared with the shader (keep in sync):
  - 16 channels: 0..3 = RGBA (premultiplied), 4..15 hidden.
  - Perception = [identity, sobel_x, sobel_y] per channel, feature index f = k*16 + c
    (k = 0 identity, 1 sobel_x, 2 sobel_y). Sobel kernels are divided by 8.
  - Dense 48 -> 128 (ReLU, bias) -> 16 (no bias, zero-init).
  - Stochastic update: each cell fires with probability 0.5.
  - Alive mask: 3x3 max-pool of alpha > 0.1, applied before and after the update.
  - Zero padding at the grid border.
"""
import argparse
import json
import math
import os
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

CH = 16
HIDDEN = 128
FIRE_RATE = 0.5
HERE = os.path.dirname(os.path.abspath(__file__))


def render_target(size, pad, emoji):
    """Render an emoji (Apple Color Emoji) to a premultiplied RGBA float array."""
    from PIL import Image, ImageDraw, ImageFont

    img = None
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 160)
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        ImageDraw.Draw(canvas).text((40, 30), emoji, font=font, embedded_color=True)
        bbox = canvas.getbbox()
        if bbox is None:
            raise RuntimeError("empty emoji render")
        img = canvas.crop(bbox)
    except Exception as exc:  # noqa: BLE001
        print("emoji render failed, using procedural target:", exc)
    if img is None:
        img = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.ellipse((10, 10, 150, 150), fill=(60, 180, 120, 255))
        d.ellipse((50, 50, 110, 110), fill=(250, 220, 90, 255))
    # fit into a square keeping aspect
    w, h = img.size
    scale = size / max(w, h)
    img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    sq = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sq.paste(img, ((size - img.size[0]) // 2, (size - img.size[1]) // 2))
    arr = np.asarray(sq).astype(np.float32) / 255.0
    arr[..., :3] *= arr[..., 3:4]  # premultiply
    full = np.zeros((size + 2 * pad, size + 2 * pad, 4), np.float32)
    full[pad : pad + size, pad : pad + size] = arr
    # save a preview for the web card
    prev = (np.clip(full, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(prev, "RGBA").save(os.path.join(HERE, "target.png"))
    return torch.from_numpy(full).permute(2, 0, 1)  # 4,H,W


class NCA(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Conv2d(CH * 3, HIDDEN, 1)
        self.fc2 = nn.Conv2d(HIDDEN, CH, 1, bias=False)
        nn.init.zeros_(self.fc2.weight)
        sx = torch.tensor([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=torch.float32) / 8.0
        sy = sx.t().contiguous()
        self.register_buffer("kx", sx.view(1, 1, 3, 3).repeat(CH, 1, 1, 1))
        self.register_buffer("ky", sy.view(1, 1, 3, 3).repeat(CH, 1, 1, 1))

    def perceive(self, x):
        gx = F.conv2d(x, self.kx, padding=1, groups=CH)
        gy = F.conv2d(x, self.ky, padding=1, groups=CH)
        return torch.cat([x, gx, gy], 1)  # feature f = k*16 + c

    @staticmethod
    def alive(x):
        return F.max_pool2d(x[:, 3:4], 3, stride=1, padding=1) > 0.1

    def forward(self, x, fire_rate=FIRE_RATE):
        pre = self.alive(x)
        dx = self.fc2(F.relu(self.fc1(self.perceive(x))))
        mask = (torch.rand(x.shape[0], 1, x.shape[2], x.shape[3], device=x.device) <= fire_rate).float()
        x = x + dx * mask
        post = self.alive(x)
        return x * (pre & post).float()


def make_seed(grid):
    seed = torch.zeros(CH, grid, grid)
    seed[3:, grid // 2, grid // 2] = 1.0
    return seed


def damage_masks(n, grid, device):
    """Random circular holes (radius ~ grid/6) like the Distill 'regenerating' setup."""
    yy, xx = torch.meshgrid(torch.arange(grid), torch.arange(grid), indexing="ij")
    masks = []
    for _ in range(n):
        cx, cy = np.random.uniform(grid * 0.25, grid * 0.75, 2)
        r = grid / 6
        m = ((xx - cx) ** 2 + (yy - cy) ** 2) > r * r
        masks.append(m.float())
    return torch.stack(masks).unsqueeze(1).to(device)  # n,1,H,W


def export(model, meta, path):
    w1 = model.fc1.weight.detach().cpu().view(HIDDEN, CH * 3)
    b1 = model.fc1.bias.detach().cpu()
    w2 = model.fc2.weight.detach().cpu().view(CH, HIDDEN)
    out = dict(meta)
    out.update(
        channels=CH,
        hidden=HIDDEN,
        fire_rate=FIRE_RATE,
        layout="feature f = k*16 + c (k: 0 identity, 1 sobel_x/8, 2 sobel_y/8); w1[h][f]; w2[c][h]",
        w1=[round(v, 6) for v in w1.flatten().tolist()],
        b1=[round(v, 6) for v in b1.tolist()],
        w2=[round(v, 6) for v in w2.flatten().tolist()],
    )
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(out, f)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--iters", type=int, default=4000)
    ap.add_argument("--emoji", default="🦎")
    ap.add_argument("--size", type=int, default=40, help="emoji size in cells")
    ap.add_argument("--pad", type=int, default=12)
    ap.add_argument("--batch", type=int, default=8)
    ap.add_argument("--pool", type=int, default=1024)
    ap.add_argument("--damage", type=int, default=3, help="damaged samples per batch (0 = off)")
    ap.add_argument("--lr", type=float, default=2e-3)
    ap.add_argument("--export-every", type=int, default=250)
    ap.add_argument("--out", default=os.path.join(HERE, "weights.json"))
    ap.add_argument("--device", default=None)
    args = ap.parse_args()

    dev = args.device or ("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    torch.manual_seed(0)
    np.random.seed(0)
    grid = args.size + 2 * args.pad
    target = render_target(args.size, args.pad, args.emoji).to(dev)  # 4,H,W
    seed = make_seed(grid).to(dev)
    pool = seed.unsqueeze(0).repeat(args.pool, 1, 1, 1)

    model = NCA().to(dev)
    opt = torch.optim.Adam(model.parameters(), lr=args.lr)
    sched = torch.optim.lr_scheduler.MultiStepLR(opt, [args.iters // 2], gamma=0.1)
    meta = dict(emoji=args.emoji, grid=grid, target_size=args.size, pad=args.pad, target_png="target.png", iters=0)

    def per_sample_loss(x):
        return ((x[:, :4] - target) ** 2).mean(dim=(1, 2, 3))

    t0 = time.time()
    hist = []
    for it in range(1, args.iters + 1):
        idx = torch.randint(0, args.pool, (args.batch,))
        x0 = pool[idx]
        with torch.no_grad():
            order = per_sample_loss(x0).argsort(descending=True)
        x0, idx = x0[order], idx[order.cpu()]
        x0[0] = seed  # always keep one fresh seed in the batch
        if args.damage:
            x0[-args.damage :] = x0[-args.damage :] * damage_masks(args.damage, grid, dev)
        steps = int(np.random.randint(64, 97))
        x = x0
        for _ in range(steps):
            x = model(x)
        loss = per_sample_loss(x).mean()
        opt.zero_grad()
        loss.backward()
        for p in model.parameters():
            if p.grad is not None:
                p.grad /= p.grad.norm() + 1e-8
        opt.step()
        sched.step()
        pool[idx] = x.detach()
        hist.append(loss.item())
        if it % 25 == 0 or it == 1:
            el = time.time() - t0
            print(f"it {it:5d}  loss {np.mean(hist[-25:]):.5f}  {el/it:.3f}s/it  eta {(args.iters-it)*el/it/60:.1f}m", flush=True)
        if it % args.export_every == 0 or it == args.iters:
            meta["iters"] = it
            meta["loss"] = float(np.mean(hist[-25:]))
            export(model, meta, args.out)
    print("done; weights at", args.out)


if __name__ == "__main__":
    main()
