# Did it really use REA?

**English** · [简体中文](is-it-rea.zh-CN.md)

Many cases are described as "built with REA". This page checks each one against the project's own README, the author's post, or the official showcase, and records what we found. Checked on 2026-10-14. X posts could not be opened from our environment, so for them we rely on the third-party case records named in the table.

| Case | README says REA? | Other source | Result |
|---|---|---|---|
| [DX-Ball](https://github.com/N0zoM1z0/dx-ball) | Yes | Official showcase | **Confirmed.** One function is byte-matched; the full game is not finished. |
| [TH04](https://github.com/N0zoM1z0/th04) | No | Official showcase | **REA only for the showcase inspection.** The reconstruction is agent-produced with ReC98 as a base. |
| Other Touhou repos (th08, th09, th10, th095, th105, th08-web, factory) | No | Author's AGENTS.md uses IDA MCP / Ghidra | **Not REA.** Tagged AI-RE. |
| [rec-rs](https://github.com/michaelshimeles/rec-rs) | Yes | — | **Confirmed.** OBS is GPL; the README says only the architecture was studied. |
| [paper-rs](https://github.com/michaelshimeles/paper-rs) | Yes | — | **Confirmed.** |
| [terminal-rs](https://github.com/michaelshimeles/terminal-rs) | Yes | — | **Confirmed.** Public TradingView pages only. |
| [wispr-flow-rea-teardown](https://github.com/az9713/wispr-flow-rea-teardown) | Yes | — | **Confirmed.** It follows a tutorial video. |
| [ledger-reborn](https://github.com/lxistired/ledger-reborn) | Yes | Discussion #2198 | **Confirmed.** |
| [AdamTerm](https://github.com/AdamLinCodes/AdamTerm) | Yes | — | **Confirmed.** |
| [hexgrab](https://github.com/iammukeshm/hexgrab) | Yes | — | **Confirmed.** |
| [baocut](https://github.com/JimLiu/baocut) | No | Author's X post; commit b8585e0 | **Claimed by the author, not in the README.** The REA part is one commit, not the whole repo. |
| [zee-rp](https://github.com/LilZeeCN/zee-rp) | No | Author's reply on X | **Claimed by the author.** Validated only on macOS. |
| [cameo](https://github.com/wquguru/cameo) | No | Follow-up X post | **Not confirmed.** The linked repo is the original app, not REA output. |
| [vd-streamer-linux](https://github.com/cudanexus/vd-streamer-linux) | Yes | — | **Confirmed.** Not yet tested on a real headset. |
| [GunZRs](https://github.com/OpenRsG/GunZRs) | Yes | — | **Confirmed.** REA's role in the port is limited (the executable is packed). |
| [OpenBattlefield2](https://github.com/Moxnatiy/OpenBattlefield2) | No (in CLAUDE.md and `tools/rea.sh`) | — | **REA is used, but not in the README.** |
| [desktop-games-nostalgia](https://github.com/ucodia/desktop-games-nostalgia) | Yes | — | **Confirmed.** |
| [rea-ski-or-die-reconstruction](https://github.com/tuunanet/rea-ski-or-die-reconstruction) | Yes | — | **Confirmed.** |
| [netcat-openbsd analysis](https://github.com/NullLabTests/OpenBSD_netcat_REA) | Yes | — | **Confirmed.** |
| [REA-demo](https://github.com/az9713/REA-demo) | Yes | — | **Confirmed.** |
| [rea-groundtruth](https://github.com/UnknownHacker1/rea-groundtruth) | Yes | — | **Confirmed.** |
| [VSL-DSP](https://github.com/grisuno/VSL-DSP) | Yes | — | **Partly.** REA helped with some vendor findings only; the repo predates REA. |
| [plx-native](https://github.com/GLinnik21/plx-native) | No | Relayed post says Ghidra + Claude Code | **Not REA.** Tagged AI-RE. |
| [open-appleremote](https://github.com/a-funk/open-appleremote) | No | Author's post does not say which tool | **Not confirmed.** |
| [universal-modder](https://github.com/rehan-remade/universal-modder) | No | Post predates REA 4.0 | **Not REA.** Tagged AI-RE. |
| [OpenGHub](https://github.com/Slyvan25/OpenGHub) | No | No AI or REA mention anywhere | **Not REA.** Manual RE from captures. |
| Firefighter (X) | — | Relayed record | **Not REA.** Tagged AI-RE. |
| Modern Warfare 2 decompilation (X) | — | Relayed record | **Not REA.** Tagged AI-RE. |

If you find a case that is wrong here, open an issue using the case form.
