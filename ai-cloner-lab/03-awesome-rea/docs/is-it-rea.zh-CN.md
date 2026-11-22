# 真的用了 REA 吗？

[English](is-it-rea.md) · **简体中文**

很多案例都写着"用 REA 做的"。这一页把每个案例和项目自己的 README、作者帖子或官方案例逐一对照，并记录结果。核对日期为 2026-10-14。我们的环境无法打开 X 帖子，所以对于 X 上的案例，我们依据的是表格里注明的第三方案例记录。

| 案例 | README 写明用了 REA？ | 其他来源 | 结论 |
|---|---|---|---|
| [DX-Ball](https://github.com/N0zoM1z0/dx-ball) | 是 | 官方案例 | **已确认。** 一个函数逐字节对上，整款游戏尚未完成。 |
| [TH04](https://github.com/N0zoM1z0/th04) | 否 | 官方案例 | **仅在官方案例的检查中用过 REA。** 复原由 Agent 产出，以 ReC98 为基础。 |
| 其他东方仓库（th08、th09、th10、th095、th105、th08-web、factory） | 否 | 作者的 AGENTS.md 写明使用 IDA MCP / Ghidra | **不是 REA。** 标注为 AI 逆向。 |
| [rec-rs](https://github.com/michaelshimeles/rec-rs) | 是 | — | **已确认。** OBS 是 GPL 许可，README 说明只研究了架构。 |
| [paper-rs](https://github.com/michaelshimeles/paper-rs) | 是 | — | **已确认。** |
| [terminal-rs](https://github.com/michaelshimeles/terminal-rs) | 是 | — | **已确认。** 只使用公开的 TradingView 页面。 |
| [wispr-flow-rea-teardown](https://github.com/az9713/wispr-flow-rea-teardown) | 是 | — | **已确认。** 按照一段教程视频进行。 |
| [ledger-reborn](https://github.com/lxistired/ledger-reborn) | 是 | Discussion #2198 | **已确认。** |
| [AdamTerm](https://github.com/AdamLinCodes/AdamTerm) | 是 | — | **已确认。** |
| [hexgrab](https://github.com/iammukeshm/hexgrab) | 是 | — | **已确认。** |
| [baocut](https://github.com/JimLiu/baocut) | 否 | 作者的 X 帖子；提交 b8585e0 | **作者说用了，但 README 没写。** REA 只涉及一次提交，不是整个仓库。 |
| [zee-rp](https://github.com/LilZeeCN/zee-rp) | 否 | 作者在 X 上的回复 | **作者说用了。** 只在 macOS 上验证过。 |
| [cameo](https://github.com/wquguru/cameo) | 否 | 作者后续的 X 帖子 | **未确认。** 链接的仓库是原创应用，不是 REA 的产出。 |
| [vd-streamer-linux](https://github.com/cudanexus/vd-streamer-linux) | 是 | — | **已确认。** 尚未在真实头显上测试。 |
| [GunZRs](https://github.com/OpenRsG/GunZRs) | 是 | — | **已确认。** 移植中 REA 的作用有限（可执行文件有加壳）。 |
| [OpenBattlefield2](https://github.com/Moxnatiy/OpenBattlefield2) | 否（写在 CLAUDE.md 和 `tools/rea.sh` 里） | — | **用了 REA，但 README 没写。** |
| [desktop-games-nostalgia](https://github.com/ucodia/desktop-games-nostalgia) | 是 | — | **已确认。** |
| [rea-ski-or-die-reconstruction](https://github.com/tuunanet/rea-ski-or-die-reconstruction) | 是 | — | **已确认。** |
| [netcat-openbsd 分析](https://github.com/NullLabTests/OpenBSD_netcat_REA) | 是 | — | **已确认。** |
| [REA-demo](https://github.com/az9713/REA-demo) | 是 | — | **已确认。** |
| [rea-groundtruth](https://github.com/UnknownHacker1/rea-groundtruth) | 是 | — | **已确认。** |
| [VSL-DSP](https://github.com/grisuno/VSL-DSP) | 是 | — | **部分确认。** REA 只帮忙找到了一些厂商相关的发现；该仓库早于 REA。 |
| [plx-native](https://github.com/GLinnik21/plx-native) | 否 | 转述的帖子说用的是 Ghidra + Claude Code | **不是 REA。** 标注为 AI 逆向。 |
| [open-appleremote](https://github.com/a-funk/open-appleremote) | 否 | 作者的帖子没有说明用了什么工具 | **未确认。** |
| [universal-modder](https://github.com/rehan-remade/universal-modder) | 否 | 帖子早于 REA 4.0 | **不是 REA。** 标注为 AI 逆向。 |
| [OpenGHub](https://github.com/Slyvan25/OpenGHub) | 否 | 任何地方都没提 AI 或 REA | **不是 REA。** 基于抓包的人工逆向。 |
| Firefighter（X） | — | 转述记录 | **不是 REA。** 标注为 AI 逆向。 |
| 《现代战争 2》反编译（X） | — | 转述记录 | **不是 REA。** 标注为 AI 逆向。 |

如果你发现这里有错误的案例，请使用案例表单提交 Issue。
