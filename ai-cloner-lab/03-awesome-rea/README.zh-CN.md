# Awesome REA：用 AI 逆向一切 [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

[English](README.md) · **简体中文**

**看看 AI Agent 逆向并重建了什么，哪些今天就能用，哪些真的用了 REA。**

> 非官方列表，与 morluto/rea 无隶属关系。

"REA" 原指 [morluto/rea](https://github.com/morluto/rea)（Reverse Engineer Anything），一个开源 MCP Server + CLI（npm 包 `rea-agents`），让 Claude Code、Codex 等编码 Agent 在**没有源码**的情况下检查原生二进制、Electron 应用、.NET 程序集、APK、固件和网站，解释功能如何实现、给出证据，再在你自己的项目里重建。它本身不做反编译，而是把 Hopper / Ghidra / IDA / JADX 等现有工具编排给 Agent 使用。

现在 "REA" 也常被用来泛指整股浪潮：AI Agent 逆向并重建闭源软件，无论用的是 REA，还是 Claude Code / Codex 加 Ghidra / IDA MCP。本列表收录这股浪潮，标明每个案例实际用了什么工具。

**标签说明**

- `REA`：项目 README、作者帖子或官方案例写明使用了 morluto/rea。
- `AI 逆向`：使用了其他 AI 工具，或未写明工具。
- `重写`：clean-room 重写，没有逆向证据。
- `待核实`：暂时无法核实。

## 先看这些

| 案例 | 做了什么 | 热度 | 标签 |
|---|---|---|---|
| [Universal Modder](https://github.com/rehan-remade/universal-modder)，作者 @rehan_shei | 把 Minecraft 内容放进你拥有的 GTA V 等游戏 | 1.4 万赞 | `AI 逆向` |
| [Steam 游戏 30 分钟跑进 Unity](https://x.com/AIWarper/status/2109060856466264566)，作者 @AIWarper | 把自己买的游戏反编译成 C#，用 Opus 5.5 | 46.7 万浏览 | `REA`（作者帖子） |
| [Claude Slides 编辑器](https://x.com/dotey/status/2109151666020794711)，作者 @dotey | 还原混淆的网页前端后用 Claude Code 重写（[baocut](https://github.com/JimLiu/baocut)，source-available） | 686 赞，8.1 万浏览（2026-10-12） | `REA`（作者帖子） |
| [LG 电视原生 Plex 客户端](https://github.com/GLinnik21/plx-native)，作者 GLinnik21 | 用 Ghidra + Claude Code 研究电视原生媒体栈，选择界面从约 30 秒降到约 3 秒 | 7,268 赞（转述） | `AI 逆向` |
| [Apple TV 遥控器接上 Linux](https://github.com/a-funk/open-appleremote)，作者 @alexzfunk | 逆向初代遥控器的蓝牙协议 | 5,419 赞 | `待核实` |
| [DX-Ball 复原](https://github.com/N0zoM1z0/dx-ball) | 一个函数复原后 3,205 个原版 x86 用例对照，63 字节逐字节一致 | 官方案例 | `REA` |

快照日期：赞数来自 [songshikang0111/awesome-REA-cases](https://github.com/songshikang0111/awesome-REA-cases)（2026-10-12）。

- [按被替代的软件找项目](docs/by-app.zh-CN.md)：Photoshop、Word、Excel、OBS、Roblox 引擎等替代项目的索引。
- [REA 说法核实](docs/is-it-rea.zh-CN.md)：逐个案例核对是否真的用了 REA。
- [本周新增](docs/new-this-week.zh-CN.md)

> ⚠️ 逆向工程受各地法律、软件许可协议和服务条款约束。本列表只收录公开信息，仅供学习、研究、互操作和软件保存用途；使用前请确认你有权分析目标软件。详见[合规与争议](#合规与争议)。

## 目录

- [官方案例](#官方案例)
- [社区案例：用 REA 做出来的东西](#社区案例用-rea-做出来的东西)
- [同一波浪潮：未写明使用 REA 的 AI 逆向项目](#同一波浪潮未写明使用-rea-的-ai-逆向项目)
- [X 上的案例与帖子](docs/x-posts.zh-CN.md)
- [插件与集成](#插件与集成)
- [教程与深度调研](#教程与深度调研)
- [相关 MCP 逆向工具](#相关-mcp-逆向工具)
- [其他列表](#其他列表)
- [社区讨论与媒体](#社区讨论与媒体)
- [按被替代的软件找项目](docs/by-app.zh-CN.md)
- [REA 说法核实](docs/is-it-rea.zh-CN.md)
- [本周新增](docs/new-this-week.zh-CN.md)
- [投稿模板](.github/ISSUE_TEMPLATE/case.yml)
- [关于 REA 的帖子与报道](docs/press-and-posts.zh-CN.md)
- [合规与争议](#合规与争议)
- [贡献](#贡献)

## 官方资源

- [morluto/rea](https://github.com/morluto/rea) - REA 主仓库，MIT 协议。`npx rea-agents setup` 一键接入 Agent。
- [rea.tools](https://rea.tools/) - 官网，含[图文指南](https://rea.tools/guides/)、[案例](https://rea.tools/showcase/)和博客。
- [rea-agents（npm）](https://www.npmjs.com/package/rea-agents) - CLI 与 MCP Server 的发布包。
- [skills.sh 上的 REA Skill](https://skills.sh/morluto/rea/reverse-engineer-anything) - 只安装调查工作流指令的 Agent Skill。
- [REA 中文 README](https://github.com/morluto/rea/blob/main/docs/readme/README_zh.md) - 官方简体中文文档。
- [MCP 工具目录的生成说明](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md#generated-catalog) - 说明如何生成全部工具、Provider 和 CLI 命令清单（生成结果不入库）。
- [morluto/awesome-reverse-engineering](https://github.com/morluto/awesome-reverse-engineering) - REA 作者维护的通用逆向工程工具与学习资源列表，CC0-1.0。
- [Discord 社区](https://discord.gg/GkcryMnJDM) - 官方 Q&A 与 Show and Tell。

## 官方案例

以下案例出自 rea.tools 官方案例页，标签为 `REA`。

- [DX-Ball：复原声像计算函数](https://rea.tools/showcase/dx-ball/) - 从一次声音调用追到位置转声像的辅助函数，补全成 C。复原的这一个函数通过 3,205 个原版 x86 对照用例，编译后 63 字节逐字节一致。整款游戏尚未完成。
- [Notion：追踪 Electron 剪贴板桥](https://rea.tools/showcase/notion/) - 从渲染进程的剪贴板 API 追到 preload、IPC 和主进程，并找到复制内容里指向本地数据的标记。
- [TH04：复原 DOS 弹幕环计算](https://rea.tools/showcase/th04/) - 分析 PC-98 版《东方幻想乡》的 16 位指令，复原固定角度与自机狙角度计算。REA 用于为案例页做的一次新检查，复原工程本身来自 TH04 项目。
- [Aegis：身份验证器如何生成登录码](https://rea.tools/showcase/aegis/) - 在 Aegis 3.4.3 的 Android 应用中追踪 TOTP 验证码的生成路径。
- [CTF：解一道 flag 校验题](https://rea.tools/showcase/ctf/) - 用 REA 解 DownUnderCTF 2023 的入门逆向题。
- [博客：逆向工程的工业革命](https://rea.tools/blog/touhou-reconstruction) - 作者 N0zoM1z0（同时参与 REA 开发）复盘东方 Project 复原的工作流程。文章强调复原工作多由 Agent 配合 IDA / Ghidra 完成，REA 只提供其中的分析证据，不应把所有结果都归为 REA 的产出。标签：`AI 逆向`。
- [博客：逆向工程需要更大的模型吗？](https://rea.tools/blog/reverse-engineering-models) - 用东方复原中的实例讨论模型能力与专用化，并提出一个对比实验的设计。文中没有报告测量结果。标签：`AI 逆向`。

## 社区案例：用 REA 做出来的东西

> 每个条目的标签说明证据来源。下面的 Star 数是 2026-10-14 的快照。

### 经典游戏复原

- [N0zoM1z0/dx-ball](https://github.com/N0zoM1z0/dx-ball) - `REA` 复原英文版 DX-Ball 1.07 的 C/C++ 代码，README 写明用了 REA。这是官方案例对应的完整仓库，作者同为 REA 的合作开发者。Alpha，MIT。
- [N0zoM1z0/th04](https://github.com/N0zoM1z0/th04) - `REA（官方案例）` 《东方幻想乡》PC-98 版源码复原，基于 ReC98 和 Turbo C++ 4.0J 编译比对。README 未提 REA，REA 的用法见上方官方案例。MIT。
- [N0zoM1z0 的东方 Project 复原系列](https://github.com/N0zoM1z0?tab=repositories) - `AI 逆向` 用 Agent 工作流复原的 [th08](https://github.com/N0zoM1z0/th08)、[th105](https://github.com/N0zoM1z0/th105)、[th095](https://github.com/N0zoM1z0/th095)、[th09](https://github.com/N0zoM1z0/th09)、[th10](https://github.com/N0zoM1z0/th10)、从源码移植到浏览器的 [th08-web](https://github.com/N0zoM1z0/th08-web)，以及统一管理这些工程的 [touhou-reconstruction-factory](https://github.com/N0zoM1z0/touhou-reconstruction-factory)。这些 README 都没有提到 REA，用的是 Codex / GPT-web 加 IDA MCP 或 Ghidra。
- [ucodia/desktop-games-nostalgia](https://github.com/ucodia/desktop-games-nostalgia) - `REA` 把 2000 年 Gemtree《Desktop Games》移植到 macOS 和浏览器，用 Claude Code + REA + Ghidra 复原图像压缩编码、素材格式和定时器。仓库未附许可证。
- [tuunanet/rea-ski-or-die-reconstruction](https://github.com/tuunanet/rea-ski-or-die-reconstruction) - `REA` 用 Rust + SDL2 重写 1990 年 MS-DOS 游戏《Ski or Die》的雪球大战小游戏，素材从你自己的游戏副本中提取。
- [Moxnatiy/OpenBattlefield2](https://github.com/Moxnatiy/OpenBattlefield2) - `REA` 用 C++20 clean-room 重实现《战地 2》的 Refractor 2 引擎。REA 用法写在 CLAUDE.md 和 `tools/rea.sh` 中，README 未提及；需要原版游戏。MIT。
- [OpenRsG/GunZRs](https://github.com/OpenRsG/GunZRs) - `REA` 用 Rust + Bevy 重写《GunZ: The Duel》，读取 Steam 安装的原版资源。原版可执行文件有加壳，REA 在移植中的作用有限。Apache-2.0。
- [a-barzanti/ai-rebuilds](https://github.com/a-barzanti/ai-rebuilds) - `REA` 社区项目，把停止更新的游戏复原到浏览器中。贡献者用 REA 写出规格，再据此构建。规则禁止提交原版游戏文件。

### 桌面应用与工具复刻

- [michaelshimeles/paper-rs](https://github.com/michaelshimeles/paper-rs) - `REA` 用 REA + Claude Code 研究 Paper 桌面应用的行为后，以 Rust（wgpu + egui）重写的无限画布设计工具，README 称为"clean-room 风格"。
- [michaelshimeles/rec-rs](https://github.com/michaelshimeles/rec-rs) - `REA` 用 REA 和 Claude Code 研究 OBS Studio 的架构与行为后写的 Rust macOS 录屏工具。OBS 本身是 GPL-2.0 开源软件，README 称只研究了架构。
- [michaelshimeles/terminal-rs](https://github.com/michaelshimeles/terminal-rs) - `REA` Bloomberg 风格的 Rust 交易终端。图表交互参考了用 REA 网站模式对 TradingView 公开页面的被动观察。仓库未附许可证。
- [az9713/wispr-flow-rea-teardown](https://github.com/az9713/wispr-flow-rea-teardown) - `REA` 拆解 Wispr Flow 的语音采集、转写和粘贴流程。每条结论标注"已证实、推断或隐藏"，再用 64 行代码在本地重建精简版。README 未提 morluto/rea，流程参考了一个教程视频。
- [iammukeshm/hexgrab](https://github.com/iammukeshm/hexgrab) - `REA` 用 REA 研究 PowerToys 取色器的已发布二进制，然后写出的 .NET 10 小工具。MIT。
- [AdamLinCodes/AdamTerm](https://github.com/AdamLinCodes/AdamTerm) - `REA` 用 REA 研究 Ghostty 后做的极简 macOS 终端，基于 SwiftTerm。仓库未附许可证。
- [JimLiu/baocut](https://github.com/JimLiu/baocut) - `REA` 宝玉（[@dotey](https://x.com/dotey/status/2109151666020794711)）用 REA 分析 Claude Slides 的网页前端，再用 Claude Code 重写编辑器。README 未提 REA，REA 的说明在作者帖子里。仓库是 **source-available（BaoCut Community License 1.0），不是开源协议**。
- [LilZeeCN/zee-rp](https://github.com/LilZeeCN/zee-rp) - `REA` 逆向 Axure RP 的 `.rp` 原型文件格式，提供 CLI 和 MCP，让 AI 读写原型。REA 的使用说明在作者回复中，README 未提。目前只在 macOS 和 Axure RP 11 上验证过。MIT。
- [wquguru/cameo](https://github.com/wquguru/cameo) - `待核实` 链接的仓库是作者自己开发的原创桌面宠物应用，不是 REA 的产出。据作者的后续帖子，REA 用于产出伪代码，再由 Claude Code 还原交互，但重建源码未公开。
- [lxistired/ledger-reborn](https://github.com/lxistired/ledger-reborn) - `REA` 用 REA 研究 QuickBooks Desktop for Mac 2024 试用版后，独立实现的本地记账应用，有早期预览版。REA 的说明见 [REA 讨论 #2198](https://github.com/morluto/rea/discussions/2198)。MIT。
- [KarlssonChristoffer/DiskLens](https://github.com/KarlssonChristoffer/DiskLens) - `REA` 仿 WinDirStat 的 Windows 11 磁盘分析工具，由 Claude Code 编写。作者先用 REA 研究了已安装的 WinDirStat 2.5.0 二进制。作者称代码未经审阅，视为实验性项目。

### 硬件、协议与驱动

- [a-funk/open-appleremote](https://github.com/a-funk/open-appleremote) - `待核实` 让初代 Apple TV Siri Remote 在 Linux 上通过蓝牙工作。纯 Python 标准库，MIT。README 和原帖都没有说明使用了哪种工具，不能判定为 REA 或其他 AI 工具。
- [grisuno/VSL-DSP](https://github.com/grisuno/VSL-DSP) - `REA（部分）` PreSonus AudioBox VSL 系列声卡的 Linux 内核模块。仓库创建于 REA 出现之前。部分 DSP 改进的厂商参考结论（如增益寄存器与 -144 dB 底噪）借助 LazyOwn 的 `rea` 插件得出，并非整个协议分析都由 REA 完成。GPL-3.0。
- [Slyvan25/OpenGHub](https://github.com/Slyvan25/OpenGHub) - `手工逆向` Linux 原生的罗技 G HUB 替代品，通过 HID++ 2.0 协议直接与外设通信。README 和代码中没有 AI 或 REA 的说明；逆向依据是抓包和设备文档，见仓库 `docs/lighting.md`。MIT。
- [cudanexus/vd-streamer-linux](https://github.com/cudanexus/vd-streamer-linux) - `REA` 用 Claude Code + REA 分析 Virtual Desktop Streamer 的官方安装包，复用协议库、替换 macOS 平台层，做出 Linux 版。README 写明尚未在真实头显上验证，只测试过模拟头显。MIT。

### 安全分析与评测

- [NullLabTests/OpenBSD_netcat_REA](https://github.com/NullLabTests/OpenBSD_netcat_REA) - `REA` 用 REA + Ghidra 对 Ubuntu 打包的 netcat-openbsd 1.234-1 做静态分析，附 JSON 产物和方法说明。MIT。
- [az9713/REA-demo](https://github.com/az9713/REA-demo) - `REA` 用 REA 分析自己的安装包，先做可证伪的预测，再对照源码自评，记录了出错的地方。
- [REA 讨论 #1406：Next.js + Stripe 应用的外部泄露检查](https://github.com/morluto/rea/discussions/1406) - `REA` 用网站模式从外部检查自己的线上应用，再与源码对照。
- [REA 讨论 #2254：剥离符号的 bzip2](https://github.com/morluto/rea/discussions/2254) - `REA` 把 REA 对剥离版二进制的分析结果，与未剥离的构建和源码逐条对照。
- [UnknownHacker1/rea-groundtruth](https://github.com/UnknownHacker1/rea-groundtruth) - `REA` 把 REA 的报告与代码中的真实情况逐项比对，为它的盲区提供一键复现脚本。MIT。

## 同一波浪潮：未写明使用 REA 的 AI 逆向项目

这些项目与 REA 同期在 X 和 GitHub 上走红。它们的 README 没有写明使用了 REA，收录在这里作为背景参考。

- [storytold/photocraft](https://github.com/storytold/photocraft) - `重写` ArtCraft 社区用 Rust 重写的 Photoshop 式图像编辑器，README 称"clean-room：只根据公开规格和观察到的行为实现"，目前是早期 alpha。Star 数 5.9 万，双协议 MIT OR Apache-2.0。
- [storytold/wordcraft](https://github.com/storytold/wordcraft)、[gridcraft](https://github.com/storytold/gridcraft)、[vectorcraft](https://github.com/storytold/vectorcraft)、[filmcraft](https://github.com/storytold/filmcraft)、[lightcraft](https://github.com/storytold/lightcraft)、[pdfcraft](https://github.com/storytold/pdfcraft)、[deckcraft](https://github.com/storytold/deckcraft)、[cadcraft](https://github.com/storytold/cadcraft)、[effectcraft](https://github.com/storytold/effectcraft)、[designcraft](https://github.com/storytold/designcraft)、[soundcraft](https://github.com/storytold/soundcraft)、[figcraft](https://github.com/storytold/figcraft) - `重写` 同系列的各款办公、设计和媒体软件重写，多数仍为 alpha 或 pre-alpha。WordCraft 的 AGENTS.md 明确禁止反汇编 Word 程序，属于黑盒重写，不是逆向。只有 FilmCraft 的 docs 写明"largely built by" Agent。同系列还有 [ArtCraft](https://github.com/storytold/artcraft) 本身（一个已有的 AI 创作应用，不是重写）。
- [AsyncFinn/rook](https://github.com/AsyncFinn/rook) - `重写` 用 Rust 重实现 Roblox 引擎，以 Studio 录制结果做一致性测试。早期开发中，Apache-2.0。
- [tallowmere/free-heroes4](https://github.com/tallowmere/free-heroes4) - `重写` C++23 重实现《魔法门之英雄无敌 IV》引擎，需要 GOG 原版文件，尚未完成。GPL-3.0。
- [designgears/wine-uwp](https://github.com/designgears/wine-uwp) - `AI 逆向` 扩展 Wine，让 Shapr3D 等 Windows 商店应用在 Linux 上运行。它不是 clean-room 重实现：会打补丁并使用微软自己的组件。Claude 辅助的说法来自作者的 X 帖子。
- [rehan-remade/universal-modder](https://github.com/rehan-remade/universal-modder) - `AI 逆向` 给 Claude Code / Codex 用的 Mod 工具集，用 AI 分析游戏引擎和素材格式，制作跨游戏的内容 Mod（例如把 Minecraft 角色放进 GTA V）。这是对你自己拥有的游戏做 Mod，不是重写游戏。MIT。
- [Firefighter：DOS 二进制到 Rust](https://x.com/esrtweet/status/2106983467141509385) - `AI 逆向` Eric S. Raymond 用 AI 从老 DOS 游戏的二进制中恢复 Pascal 逻辑，再转写为 Rust。作者称工作完成于几个月前，10 月 5 日只是分享日期。未找到公开代码。
- [《现代战争 2》多 Agent 反编译](https://x.com/momo5502/status/2108886652391141721) - `AI 逆向` 作者称 17 个 Agent 协作约三个月，83% 的函数达到字节级匹配。代码不公开。

## 插件与集成

- [zhaofeng130/dsh-rea](https://github.com/zhaofeng130/dsh-rea) - DeepSeek Harness 适配器，在每个会话中注册 REA Skill 以及 `rea` / `rea_doctor` 工具。
- [ya123-4/rea-dsh-plugin](https://github.com/ya123-4/rea-dsh-plugin) - DeepSeek Harness 插件，安装后把 REA MCP 注册为 `mcp__rea__*` 工具并附带 Skill。
- [sheilacraig/dsh-rea-mcp](https://github.com/sheilacraig/dsh-rea-mcp) - 纯配置的 DeepSeek Harness bundle，用内置 MCP 客户端挂载 REA。
- [cognixws/picode-rea](https://github.com/cognixws/picode-rea) - PiCode 扩展，只启用 REA 的静态分析工具。当前版本固定为 rea-agents 6.1.0，最新为 6.4.0。
- [pablodiazjorge/rea-casebook](https://github.com/pablodiazjorge/rea-casebook) - Claude Code mod，实时记录 REA 返回的证据，要求结论必须引用真实的 `evidence_id`，可导出 Markdown。
- [laaielichter/reverseport](https://github.com/laaielichter/reverseport) - 把逆向结果移植到 Godot、Unity、Unreal、three.js 的 CLI + MCP。**注意**：README 写明其深度分析引擎"基于 REA"，THIRD_PARTY_NOTICES 也称 REA 代码以 MIT 授权，它更像是 REA 的衍生版本，而不是独立工具。
- [Nowng/rea-mcp](https://github.com/Nowng/rea-mcp) - LM Studio 插件，封装原版 REA MCP Server，方便接本地模型。运行时会克隆 REA。
- [sickpyramid/ReaFuse](https://github.com/sickpyramid/ReaFuse) - 基于 REA 拆解两个 JS/TS 源码项目、融合它们的能力，生成新项目并验证。v0.1，Alpha。
- [dav1dngy/era-agent](https://github.com/dav1dngy/era-agent) - 基于 REA 的逆向 Agent，加入以证据驱动的自我改进实验室。实验性，v0.1.0。
- [alexmi256/rea-agent-docker](https://github.com/alexmi256/rea-agent-docker) - REA 的 Docker 镜像，共四个：Ghidra + Hopper 合并版，以及 ghidra、hopper、ida 单独版。IDA 镜像不包含 IDA 本身，仅支持 linux/amd64。
- [moonfruit/homebrew-tap](https://github.com/moonfruit/homebrew-tap/blob/main/Formula/rea-agents.rb) - 一位个人的 Homebrew tap，不是 homebrew-core 官方收录。
- [czcdr/dsh-plugin-rea](https://github.com/czcdr/dsh-plugin-rea) - 第三方适配插件，把 morluto/rea 的 MCP 服务接入 DeepSeek Harness，提供 `mcp__rea__*` 工具。2.x 会自动安装 REA CLI、JDK 和 Ghidra。
- [ShadowSwaps/REA-Reconstruction-Companion](https://github.com/ShadowSwaps/REA-Reconstruction-Companion) - Agent Skill，把 REA 的发现整理成复原所需的规格、架构、计划和验证步骤。

## 教程与深度调研

- [ringozzt/rea-research](https://github.com/ringozzt/rea-research) - 🇨🇳 中文深度技术调研：架构、证据模型、DX-Ball 数字的真实含义、信任模型、Star 与安装量的差距，以及争议背景。仓库未附许可证，数据快照为 10-11。推荐先读。
- [pablodiazjorge/rea-lab](https://github.com/pablodiazjorge/rea-lab) - 🇪🇸 Windows + Ghidra 环境下的 REA 搭建、练习题和工具评测。其预注册的第一项研究发现：Claude Code 有无 REA 解出的题目数相同（30 题中 28 题），但使用 REA 时每次运行约慢一倍、花费更高。这是本列表中唯一的对照实验。
- [jinshi666888/rea-playbook](https://github.com/jinshi666888/rea-playbook) - 🇨🇳 动手实验：最小 Electron 靶机、带 `file:line` 引用的证据提取、MCP 探针，跑通"反编译 → 理解 → 重建"闭环。
- [valorisa/Reverse-Engineer-Anything](https://github.com/valorisa/Reverse-Engineer-Anything) - 🇫🇷 法语非官方教学指南，含逆向工程的法律框架。
- [REA: Reverse Engineer Anything with AI Agents & MCP（HoangYell）](https://hoangyell.com/rea-explained/) - 英文入门讲解。
- [Reverse Engineer Anything: What the Viral REA MCP Actually Does（MindStudio）](https://www.mindstudio.ai/blog/reverse-engineer-anything-mcp) - 去掉炒作后，REA 实际能做什么。
- [Agentic Reverse Engineering: What REA Is and How to Start（El Solitario）](https://elsolitario.org/en/2026/10/10/rea-reverse-engineering-for-coding-agents/) - 上手教程。
- [How To Use REA To Clone Any Software In Minutes（Eric Tech，YouTube）](https://www.youtube.com/watch?v=FnB9tHKBJXQ) - 视频教程。
- [inematds/rea-engenharia-reversa](https://github.com/inematds/rea-engenharia-reversa) - 🇧🇷 有葡语、英语和西语三个版本的 REA 指南，包含链接、案例、客观评估和实际测试。
- [ZooHero500/reatool](https://github.com/ZooHero500/reatool) - 非官方的 REA 教程与对比，讲如何在编码 Agent 中安装和使用。与 morluto 无关。

## 相关 MCP 逆向工具

REA 编排的底层工具，或同类的"给 Agent 用的逆向工具"。

- [mrexodia/ida-pro-mcp](https://github.com/mrexodia/ida-pro-mcp) - 把 IDA Pro 接入大模型的 MCP Server。REA 的 IDA Pro 支持基于它。作者现在推荐使用官方的 [HexRaysSA/ida-mcp](https://github.com/HexRaysSA/ida-mcp)。
- [0xshlomil/ida-free-mcp](https://github.com/0xshlomil/ida-free-mcp) - REA 的 IDA Free 原生桥接方案，见 REA 的 `docs/ida-provider.md`。
- [LaurieWired/GhidraMCP](https://github.com/LaurieWired/GhidraMCP) - Ghidra 的 MCP Server。REA 直接调用 Ghidra 的 `analyzeHeadless`，不经过这个项目，二者是同类工具。
- [N0zoM1z0/touhou-reverse-engineering](https://github.com/N0zoM1z0/touhou-reverse-engineering) - `AI 逆向` 基于 IDA Pro + Codex 的逆向笔记，以证据为先，记录运行时补丁等实验。README 未提 REA。

## 其他列表

- [sqwu/rea-gems](https://github.com/sqwu/rea-gems) - 每天自动更新的 REA 案例库，抓取官方案例、GitHub、HN 和 Reddit。镜像克隆较多，需人工甄别。
- [miles990/rea-case-rankings](https://github.com/miles990/rea-case-rankings) - 按统一评分标准排名的 REA 案例榜，每日更新，提供 JSON / RSS / llms.txt。原名 `rea-awesome`，已改名。
- [kaixinbaba/awesome-rea](https://github.com/kaixinbaba/awesome-rea) - 开源逆向、重实现与兼容替代品目录（[awesomerea.com](https://awesomerea.com)），不要求使用 REA。
- [zhuyansen/awesome-ai-reverse-engineering](https://github.com/zhuyansen/awesome-ai-reverse-engineering) - AI 逆向工具列表，每个仓库都有安全评级，中英双语。
- [DiscoverBox/awesome-ai-reverse](https://github.com/DiscoverBox/awesome-ai-reverse) - 🇨🇳 AI 辅助逆向工具清单，覆盖 MCP、Skill、插件、Agent。
- [songshikang0111/awesome-REA-cases](https://github.com/songshikang0111/awesome-REA-cases) - 🇨🇳 每天多次追踪 REA 与 AI 逆向公开案例，当前收录 139 个案例与项目，按游戏、硬件、应用、算法分类，并标明是否确认使用了 REA。
- [Asymmetrical-1024/awsome-REA](https://github.com/Asymmetrical-1024/awsome-REA) - 🇨🇳 REA 案例合集，每条附 X 原帖截图、证据切片和验证边界。
- [yibie/awesome-rea](https://github.com/yibie/awesome-rea) - 只收录有明确验收标准的 AI 反编译和移植案例。
- [heaven-hm/awesome-reverse-engineered-games](https://github.com/heaven-hm/awesome-reverse-engineered-games) - 英文，AI 重建的游戏。
- [SubmitGame/awesome-decomp-games](https://github.com/SubmitGame/awesome-decomp-games) - 英文，反编译游戏，首屏即可在浏览器中直接游玩，CC0 许可。

## 社区讨论与媒体

- [Hacker News：Reverse engineer anything with agents, from app behavior down to native binaries](https://news.ycombinator.com/item?id=50058850)
- [GitHub 讨论：减少 REA 工作流的 token 浪费](https://github.com/morluto/rea/discussions/1958)
- [GitHub 讨论：Fedora 系 Linux 上的安装笔记与坑](https://github.com/morluto/rea/discussions/1435)
- [GitHub 讨论：Linux 上的基准测试（Node 22/24/26 启动与五个本地模型）](https://github.com/morluto/rea/discussions/1998)
- [Startup Fortune：An AI agent that reverse engineers any software just hit number one on GitHub](https://startupfortune.com/an-ai-agent-that-reverse-engineers-any-software-just-hit-number-one-on-github/)
- [Cybersecurity News：REA Tool Connects Claude Code and Cursor to Ghidra and IDA Pro](https://cybersecuritynews.com/reverse-engineer-anything-tool/)
- [CyberPress：New Open-Source REA Tool Lets AI Agents Reverse Engineer Software Without Source Code](https://cyberpress.org/new-open-source-rea-tool/)
- [RuntimeWire：Matthew Berman promotes REA](https://runtimewire.com/article/matthew-berman-rea-ai-reverse-engineering)
- [MayhemCode：REA Reverse Engineering Tool: Can AI Clone Your App's Features?](https://www.mayhemcode.com/2026/10/rea-reverse-engineering-tool-can-ai.html)

更多 X 帖子、盘点、争议观点和媒体，见 [关于 REA 的帖子与报道](docs/press-and-posts.zh-CN.md)。

## 合规与争议

REA 走红的同时也带来不少争议，选用和传播案例时值得注意：

- **clean-room 是否成立**：批评者认为，同一个 Agent 既做逆向又做重建，达不到传统 clean-room 开发要求的人员隔离。
- **能力边界**：官方并不声称能恢复原始源码或自动克隆整个应用。DX-Ball 的 3,205 / 63 是单个函数级别的验证，不代表整款程序的克隆（见 [rea-research](https://github.com/ringozzt/rea-research) 的分析）。
- **隐私与信任模型**：分析在本地运行，但工具结果会经 Agent 发给模型供应商；官方 SECURITY.md 也明确它不是沙箱。
- **商业工具授权**：IDA Pro、Hopper、JEB 等商业工具必须合法取得授权，REA 不提供任何许可证。
- **服务条款**：Anthropic、OpenAI 的服务条款禁止逆向其自家服务。这些条款不涉及逆向其他软件，但涉及 Claude Slides、Claude Code、Claude Chrome、Codex 浏览器等的案例，使用前应自行阅读条款原文。
- **官方立场**：REA 的 DISCLAIMER.md 列出的用途包括学习、研究、互操作、软件保存、安全研究、漏洞协调披露和 CTF；同时明确不允许复制专有软件或复制其受保护的代码和资源。见 [DISCLAIMER.md](https://github.com/morluto/rea/blob/main/DISCLAIMER.md)。

本列表不收录以绕过授权、复制付费功能或分发受版权保护资源为主要目的的项目。

**谨防假冒下载**：GitHub 上出现了自称"REA 官方免费下载"的 zip 包仓库。REA 的官方发布渠道是 [morluto/rea](https://github.com/morluto/rea)、[rea.tools](https://rea.tools/) 和 npm 上的 `rea-agents`（`npx rea-agents setup`），不要下载来路不明的压缩包或 exe。

## 贡献

欢迎通过 Issue 或 PR 推荐新的项目、案例和文章。收录标准：

1. 优先收录**开源**项目，并附上源码链接。没有源码的案例放在 [X 页面](docs/x-posts.zh-CN.md)。
2. 社区案例需要在项目 README、作者帖子或官方案例中写明使用了 REA，并给出证据链接；否则放在"同一波浪潮"。
3. 每条一行，格式为 `- [名称](链接) - 一句话说明它做了什么，并标注标签。`
4. 不收录镜像、纯 fork，或以侵权、绕过授权为主要目的的项目。
5. 下架请求：提交 Issue 说明项目名称和理由，我们会移除条目并保留证据存档。
