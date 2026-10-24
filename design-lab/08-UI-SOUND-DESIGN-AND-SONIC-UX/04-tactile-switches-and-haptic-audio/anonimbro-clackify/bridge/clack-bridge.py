#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLACKIFY — EXTERNAL HOOK BRIDGE
================================
Helper lokal yang membaca keyboard GLOBAL (low-level hook Windows) lalu mengirim
tiap event ke halaman Clackify lewat SSE di localhost, supaya suara clack tetap
berbunyi saat kamu mengetik di aplikasi lain (Word, VSCode, browser tab lain).

Kenapa perlu helper? Halaman web TIDAK BOLEH membaca ketikan global — itu batas
keamanan browser. Helper ini yang membaca, halaman hanya menerima perintahnya.
Halaman boleh duduk di tab belakang / jendela terminimize; AudioContext tetap
berjalan (sudah diverifikasi: 127 blok audio dirender saat tab hidden).

PRIVASI
-------
- Hanya kode tombol (mis. 'KeyA', 'Space') yang diteruskan — bukan isi dokumen.
- Tidak ada yang ditulis ke disk, tidak ada koneksi keluar. Semua di localhost.
- Helper melihat SEMUA ketikan mesin ini (memang itu fungsinya). Tersedia jeda
  cepat: Ctrl+Alt+P (helper berhenti meneruskan sampai ditekan lagi).

PAKAI
-----
    python bridge/clack-bridge.py
    python bridge/clack-bridge.py --port 8091 --dev-inject
    python bridge/clack-bridge.py --selftest      # cek tabel pemetaan tombol
    python bridge/clack-bridge.py --no-hook       # server SSE saja (tanpa hook)

Endpoint: GET /events (SSE), GET /health (JSON), POST /inject (hanya --dev-inject)
"""
from __future__ import annotations

import argparse
import ctypes
import json
import queue
import sys
import threading
import time
from ctypes import wintypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

IS_WINDOWS = sys.platform.startswith("win")

# ---------------------------------------------------------------------------
# 1. PEMETAAN VIRTUAL-KEY -> DOM code/key  (agar identik dengan ketikan asli)
# ---------------------------------------------------------------------------

VK_TO_DOM: dict[int, tuple[str, str]] = {
    0x08: ("Backspace", "Backspace"),
    0x09: ("Tab", "Tab"),
    0x0D: ("Enter", "Enter"),
    0x13: ("Pause", "Pause"),
    0x14: ("CapsLock", "CapsLock"),
    0x1B: ("Escape", "Escape"),
    0x20: ("Space", " "),
    0x21: ("PageUp", "PageUp"),
    0x22: ("PageDown", "PageDown"),
    0x23: ("End", "End"),
    0x24: ("Home", "Home"),
    0x25: ("ArrowLeft", "ArrowLeft"),
    0x26: ("ArrowUp", "ArrowUp"),
    0x27: ("ArrowRight", "ArrowRight"),
    0x28: ("ArrowDown", "ArrowDown"),
    0x2C: ("PrintScreen", "PrintScreen"),
    0x2D: ("Insert", "Insert"),
    0x2E: ("Delete", "Delete"),
    0x5B: ("MetaLeft", "Meta"),
    0x5C: ("MetaRight", "Meta"),
    0x5D: ("ContextMenu", "ContextMenu"),
    0x90: ("NumLock", "NumLock"),
    0x91: ("ScrollLock", "ScrollLock"),
    0xA0: ("ShiftLeft", "Shift"),
    0xA1: ("ShiftRight", "Shift"),
    0xA2: ("ControlLeft", "Control"),
    0xA3: ("ControlRight", "Control"),
    0xA4: ("AltLeft", "Alt"),
    0xA5: ("AltRight", "Alt"),
    0x10: ("ShiftLeft", "Shift"),
    0x11: ("ControlLeft", "Control"),
    0x12: ("AltLeft", "Alt"),
}

for _i in range(26):                                     # A-Z
    VK_TO_DOM[0x41 + _i] = ("Key" + chr(65 + _i), chr(97 + _i))
for _i in range(10):                                     # 0-9 (baris atas)
    VK_TO_DOM[0x30 + _i] = ("Digit" + str(_i), str(_i))
for _i in range(10):                                     # numpad 0-9
    VK_TO_DOM[0x60 + _i] = ("Numpad" + str(_i), str(_i))
for _i in range(24):                                     # F1-F24
    VK_TO_DOM[0x70 + _i] = ("F" + str(_i + 1), "F" + str(_i + 1))

VK_TO_DOM.update({
    0x6A: ("NumpadMultiply", "*"), 0x6B: ("NumpadAdd", "+"),
    0x6C: ("NumpadSeparator", ","), 0x6D: ("NumpadSubtract", "-"),
    0x6E: ("NumpadDecimal", "."), 0x6F: ("NumpadDivide", "/"),
    0xBA: ("Semicolon", ";"), 0xBB: ("Equal", "="), 0xBC: ("Comma", ","),
    0xBD: ("Minus", "-"), 0xBE: ("Period", "."), 0xBF: ("Slash", "/"),
    0xC0: ("Backquote", "`"), 0xDB: ("BracketLeft", "["), 0xDC: ("Backslash", "\\"),
    0xDD: ("BracketRight", "]"), 0xDE: ("Quote", "'"),
})

SHIFT_MAP = {"1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
             "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", "[": "{", "]": "}",
             "\\": "|", ";": ":", "'": '"', ",": "<", ".": ">", "/": "?", "`": "~"}

MOD_VKS = {0x10, 0x11, 0x12, 0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0x5B, 0x5C}
CTRL_VKS = {0x11, 0xA2, 0xA3}
ALT_VKS = {0x12, 0xA4, 0xA5}
SHIFT_VKS = {0x10, 0xA0, 0xA1}
META_VKS = {0x5B, 0x5C}

PAUSE_COMBO = (0x50, "Ctrl+Alt+P")     # helper-side pause, tidak diteruskan


def describe(vk: int, shift: bool = False) -> tuple[str, str] | None:
    """Kembalikan (code, key) ala KeyboardEvent, atau None bila tak dikenal."""
    hit = VK_TO_DOM.get(vk)
    if not hit:
        return None
    code, key = hit
    if shift:
        if len(key) == 1 and key.isalpha():
            key = key.upper()
        elif len(key) == 1 and key in SHIFT_MAP:
            key = SHIFT_MAP[key]
    return code, key


# ---------------------------------------------------------------------------
# 2. HUB — sebarkan event ke semua klien SSE
# ---------------------------------------------------------------------------

class Hub:
    def __init__(self) -> None:
        self._clients: set[queue.Queue] = set()
        self._lock = threading.Lock()
        self.published = 0
        self.clients_seen = 0

    def subscribe(self) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=512)
        with self._lock:
            self._clients.add(q)
            self.clients_seen += 1
        return q

    def unsubscribe(self, q: queue.Queue) -> None:
        with self._lock:
            self._clients.discard(q)

    def publish(self, payload: str) -> None:
        self.published += 1
        with self._lock:
            targets = list(self._clients)
        for q in targets:
            try:
                q.put_nowait(payload)
            except queue.Full:                      # klien lambat -> lewati
                pass

    @property
    def clients(self) -> int:
        with self._lock:
            return len(self._clients)


# ---------------------------------------------------------------------------
# 3. HOOK KEYBOARD GLOBAL (Windows low-level, ctypes murni)
# ---------------------------------------------------------------------------

if IS_WINDOWS:
    _user32 = ctypes.WinDLL("user32", use_last_error=True)
    _kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)

    WH_KEYBOARD_LL = 13
    WM_KEYDOWN, WM_KEYUP = 0x0100, 0x0101
    WM_SYSKEYDOWN, WM_SYSKEYUP = 0x0104, 0x0105
    LLKHF_INJECTED = 0x10

    class KBDLLHOOKSTRUCT(ctypes.Structure):
        _fields_ = [("vkCode", wintypes.DWORD), ("scanCode", wintypes.DWORD),
                    ("flags", wintypes.DWORD), ("time", wintypes.DWORD),
                    ("dwExtraInfo", ctypes.c_void_p)]

    HOOKPROC = ctypes.WINFUNCTYPE(ctypes.c_ssize_t, ctypes.c_int,
                                  wintypes.WPARAM, wintypes.LPARAM)

    _user32.SetWindowsHookExW.argtypes = [ctypes.c_int, HOOKPROC,
                                          ctypes.c_void_p, wintypes.DWORD]
    _user32.SetWindowsHookExW.restype = ctypes.c_void_p
    _user32.CallNextHookEx.argtypes = [ctypes.c_void_p, ctypes.c_int,
                                       wintypes.WPARAM, wintypes.LPARAM]
    _user32.CallNextHookEx.restype = ctypes.c_ssize_t
    _user32.UnhookWindowsHookEx.argtypes = [ctypes.c_void_p]
    _user32.UnhookWindowsHookEx.restype = wintypes.BOOL

    # WAJIB: tanpa restype c_void_p, handle modul dipotong ke 32-bit di Windows
    # 64-bit -> SetWindowsHookEx gagal dengan error 126 (ERROR_MOD_NOT_FOUND).
    _kernel32.GetModuleHandleW.argtypes = [wintypes.LPCWSTR]
    _kernel32.GetModuleHandleW.restype = ctypes.c_void_p


class KeyboardHook:
    """Low-level keyboard hook: menjalankan message loop di thread sendiri."""

    def __init__(self, on_event, on_pause=None, log=print) -> None:
        self.on_event = on_event
        self.on_pause = on_pause
        self.log = log
        self.paused = False
        self.installed = False
        self.error: str | None = None
        self._pressed: set[int] = set()
        self._thread: threading.Thread | None = None
        self._proc = None            # WAJIB disimpan agar tidak di-GC
        self._hook = None

    # -- callback ----------------------------------------------------------
    def _callback(self, n_code, w_param, l_param):
        try:
            if n_code == 0:
                kb = ctypes.cast(l_param, ctypes.POINTER(KBDLLHOOKSTRUCT)).contents
                vk = int(kb.vkCode)
                down = w_param in (WM_KEYDOWN, WM_SYSKEYDOWN)
                up = w_param in (WM_KEYUP, WM_SYSKEYUP)

                if down and vk not in self._pressed:
                    repeat = False
                    self._pressed.add(vk)
                else:
                    repeat = down

                ctrl = any(v in self._pressed for v in CTRL_VKS)
                alt = any(v in self._pressed for v in ALT_VKS)
                shift = any(v in self._pressed for v in SHIFT_VKS)
                meta = any(v in self._pressed for v in META_VKS)

                if up:
                    self._pressed.discard(vk)

                if down and ctrl and alt and vk == PAUSE_COMBO[0]:
                    self.paused = not self.paused
                    if self.on_pause:
                        self.on_pause(self.paused)
                    return _user32.CallNextHookEx(None, n_code, w_param, l_param)

                if not self.paused and (down or up):
                    mapped = describe(vk, shift)
                    if mapped:
                        code, key = mapped
                        self.on_event({
                            "type": "down" if down else "up",
                            "code": code, "key": key, "vk": vk,
                            "ctrl": ctrl, "alt": alt, "shift": shift, "meta": meta,
                            "repeat": bool(repeat),
                            "injected": bool(kb.flags & LLKHF_INJECTED),
                            "t": time.time() * 1000.0,
                        })
        except Exception as exc:                     # hook tidak boleh mati
            self.log(f"[HOOK] error di callback: {exc}")
        return _user32.CallNextHookEx(None, n_code, w_param, l_param)

    # -- lifecycle ---------------------------------------------------------
    def start(self) -> None:
        if not IS_WINDOWS:
            self.error = "hook hanya tersedia di Windows"
            return
        self._thread = threading.Thread(target=self._run, name="kb-hook", daemon=True)
        self._thread.start()

    def _run(self) -> None:
        self._proc = HOOKPROC(self._callback)
        hmod = _kernel32.GetModuleHandleW(None)
        self._hook = _user32.SetWindowsHookExW(WH_KEYBOARD_LL, self._proc, hmod, 0)
        if not self._hook:
            first_err = ctypes.get_last_error()
            # cadangan: hMod NULL (juga sah untuk low-level hook)
            ctypes.set_last_error(0)
            self._hook = _user32.SetWindowsHookExW(WH_KEYBOARD_LL, self._proc, None, 0)
            if not self._hook:
                self.error = (f"SetWindowsHookEx gagal (hMod err={first_err}, "
                              f"NULL err={ctypes.get_last_error()})")
                self.log(f"[HOOK] {self.error}")
                return
        self.installed = True
        self.log("[HOOK] terpasang — membaca keyboard global")
        msg = wintypes.MSG()
        while _user32.GetMessageW(ctypes.byref(msg), None, 0, 0) != 0:
            _user32.TranslateMessage(ctypes.byref(msg))
            _user32.DispatchMessageW(ctypes.byref(msg))
        _user32.UnhookWindowsHookEx(self._hook)
        self.installed = False


# ---------------------------------------------------------------------------
# 4. SERVER HTTP + SSE
# ---------------------------------------------------------------------------

def make_handler(hub: Hub, cfg: argparse.Namespace):
    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"
        server_version = "ClackBridge/1.0"

        def log_message(self, *args):                 # jangan cemari stdout
            pass

        def _cors(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

        def _chunk(self, text: str) -> None:
            data = text.encode("utf-8")
            self.wfile.write(b"%X\r\n" % len(data) + data + b"\r\n")
            self.wfile.flush()

        # GET ---------------------------------------------------------------
        def do_GET(self):
            path = self.path.split("?")[0]
            if path == "/health":
                body = json.dumps({
                    "ok": True, "hook": HOOK["installed"], "hook_error": HOOK["error"],
                    "paused": HOOK["paused"], "clients": hub.clients,
                    "published": hub.published, "port": cfg.port,
                    "dev_inject": bool(cfg.dev_inject),
                }).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self._cors()
                self.end_headers()
                self.wfile.write(body)
                return

            if path == "/events":
                q = hub.subscribe()
                try:
                    self.send_response(200)
                    self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                    self.send_header("Cache-Control", "no-cache, no-store")
                    self.send_header("Transfer-Encoding", "chunked")
                    self._cors()
                    self.end_headers()
                    self._chunk(": clackify bridge online\n\n")
                    self._chunk("data: " + json.dumps({"type": "hello", "t": time.time() * 1000.0}) + "\n\n")
                    while True:
                        try:
                            payload = q.get(timeout=15)
                        except queue.Empty:
                            self._chunk(": ping\n\n")      # jaga koneksi tetap hidup
                            continue
                        self._chunk("data: " + payload + "\n\n")
                except (BrokenPipeError, ConnectionResetError, OSError):
                    pass
                finally:
                    hub.unsubscribe(q)
                return

            self.send_response(404)
            self.send_header("Content-Length", "0")
            self._cors()
            self.end_headers()

        # POST --------------------------------------------------------------
        def do_POST(self):
            path = self.path.split("?")[0]
            if path == "/inject" and cfg.dev_inject:
                length = int(self.headers.get("Content-Length") or 0)
                raw = self.rfile.read(length) if length else b"{}"
                try:
                    evt = json.loads(raw or b"{}")
                except ValueError:
                    evt = {}
                evt.setdefault("type", "down")
                evt.setdefault("code", "KeyA")
                evt.setdefault("key", "a")
                evt.setdefault("t", time.time() * 1000.0)
                evt["injected"] = True
                hub.publish(json.dumps(evt))
                body = b'{"ok":true}'
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self._cors()
                self.end_headers()
                self.wfile.write(body)
                return
            self.send_response(404)
            self.send_header("Content-Length", "0")
            self._cors()
            self.end_headers()

    return Handler


# status hook yang dibagikan ke /health
HOOK = {"installed": False, "error": None, "paused": False}


class BridgeServer(ThreadingHTTPServer):
    """Di Windows SO_REUSEADDR membuat dua instance bisa bind port yang sama —
    itu berarti dua hook aktif dan suara dobel. Matikan agar instance kedua
    gagal dengan jelas (port sudah dipakai)."""
    allow_reuse_address = False
    daemon_threads = True


# ---------------------------------------------------------------------------
# 5. SELFTEST
# ---------------------------------------------------------------------------

def selftest() -> int:
    print("CLACKIFY BRIDGE — SELFTEST TABEL PEMETAAN")
    print("-" * 58)
    cases = [
        (0x41, False, ("KeyA", "a")), (0x41, True, ("KeyA", "A")),
        (0x20, False, ("Space", " ")), (0x0D, False, ("Enter", "Enter")),
        (0x08, False, ("Backspace", "Backspace")), (0x1B, False, ("Escape", "Escape")),
        (0x25, False, ("ArrowLeft", "ArrowLeft")), (0x31, True, ("Digit1", "!")),
        (0xBD, True, ("Minus", "_")), (0xBA, False, ("Semicolon", ";")),
        (0xA0, False, ("ShiftLeft", "Shift")), (0xA2, False, ("ControlLeft", "Control")),
        (0x70, False, ("F1", "F1")), (0x60, False, ("Numpad0", "0")),
        (0xBC, True, ("Comma", "<")), (0x09, False, ("Tab", "Tab")),
    ]
    bad = 0
    for vk, shift, want in cases:
        got = describe(vk, shift)
        ok = got == want
        bad += 0 if ok else 1
        print(f"  {'OK ' if ok else 'GAGAL'}  vk=0x{vk:02X} shift={int(shift)}  ->  {got}   (harap {want})")
    total = len(VK_TO_DOM)
    print("-" * 58)
    print(f"  {total} tombol terpetakan · {len(cases)} uji · {bad} gagal")
    print(f"  platform: {sys.platform} · hook tersedia: {IS_WINDOWS}")
    return 1 if bad else 0


# ---------------------------------------------------------------------------
# 6. MAIN
# ---------------------------------------------------------------------------

BANNER = r"""
  ██████╗██╗      █████╗  ██████╗██╗  ██╗    ██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗
 ██╔════╝██║     ██╔══██╗██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝
 ██║     ██║     ███████║██║     █████╔╝     ██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗
 ██║     ██║     ██╔══██║██║     ██╔═██╗     ██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝
 ╚██████╗███████╗██║  ██║╚██████╗██║  ██╗    ██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗
  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝
  EXTERNAL HOOK BRIDGE · v1.0 · GLOBAL KEYBOARD -> LOCALHOST SSE -> BROWSER AUDIO
"""


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Clackify external hook bridge")
    ap.add_argument("--port", type=int, default=8091, help="port SSE (default 8091)")
    ap.add_argument("--host", default="127.0.0.1", help="bind address (default 127.0.0.1)")
    ap.add_argument("--dev-inject", action="store_true", help="aktifkan POST /inject (untuk QA)")
    ap.add_argument("--no-hook", action="store_true", help="tanpa hook keyboard (server saja)")
    ap.add_argument("--selftest", action="store_true", help="uji tabel pemetaan lalu keluar")
    ap.add_argument("--quiet", action="store_true", help="tanpa banner")
    cfg = ap.parse_args(argv)

    if cfg.selftest:
        return selftest()

    if not cfg.quiet:
        print(BANNER)

    hub = Hub()
    outbound: queue.Queue = queue.Queue()

    def publisher() -> None:
        while True:
            hub.publish(outbound.get())

    threading.Thread(target=publisher, name="publisher", daemon=True).start()

    def on_event(evt: dict) -> None:
        outbound.put(json.dumps(evt))

    def on_pause(paused: bool) -> None:
        print(f"[HOOK] {'DIJEDA' if paused else 'LANJUT'} — tekan Ctrl+Alt+P untuk membalik")

    hook = KeyboardHook(on_event, on_pause)
    if not cfg.no_hook:
        hook.start()
        time.sleep(0.6)                      # beri waktu hook terpasang
        HOOK["installed"] = hook.installed
        HOOK["error"] = hook.error
    else:
        HOOK["error"] = "dimatikan (--no-hook)"

    def watch_pause() -> None:               # pantulkan status pause ke /health
        while True:
            HOOK["paused"] = hook.paused
            time.sleep(0.3)

    threading.Thread(target=watch_pause, daemon=True).start()

    try:
        server = BridgeServer((cfg.host, cfg.port), make_handler(hub, cfg))
    except OSError as exc:
        print(f"\n[BRIDGE] GAGAL BIND PORT {cfg.port}: {exc}")
        print(f"         Kemungkinan bridge lain masih jalan (dua hook = suara dobel).")
        print(f"         Tutup instance lama (Ctrl+C di jendelanya), atau pakai --port lain.")
        print(f"         Cek cepat: curl http://{cfg.host}:{cfg.port}/health")
        return 2

    threading.Thread(target=server.serve_forever, name="http", daemon=True).start()

    print(f"  endpoint   : http://{cfg.host}:{cfg.port}/events")
    print(f"  health     : http://{cfg.host}:{cfg.port}/health")
    print(f"  hook       : {'TERPASANG' if HOOK['installed'] else ('NONAKTIF — ' + str(HOOK['error']))}")
    print(f"  dev inject : {'AKTIF' if cfg.dev_inject else 'nonaktif'}")
    print("  jeda cepat : Ctrl+Alt+P     hentikan : Ctrl+C")
    print("  status     : MENUNGGU HALAMAN CLACKIFY TERHUBUNG...\n")

    try:
        while True:
            time.sleep(1.0)
    except KeyboardInterrupt:
        print("\n[BRIDGE] shutdown — hook dilepas, server ditutup.")
    finally:
        server.shutdown()
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
