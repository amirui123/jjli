# X（Twitter）上的 REA 帖子

[← 返回主列表](../README.zh-CN.md)

> 这一页收录 X 上的帖子，多数是作者自述，没有公开代码，也没经过独立验证。浏览量为 2026-10-14 查看时的数字，仅供参考。帖子的 REA 用法标签以[主列表](../README.zh-CN.md)为准。


浏览量为 2026-10-14 查看时的数字，仅供参考。

### 实测与案例

- [宝玉：用 REA 逆向 Claude Slides 的编辑器](https://x.com/dotey/status/2109151666020794711) - 🇨🇳 下载网页端脚本和样式表，让 Codex 装上 REA Skill 还原混淆代码，再用 Claude Code 重写成结构清晰的工程，附完整步骤。代码在 [JimLiu/baocut](https://github.com/JimLiu/baocut) 的 `apps/slides-editor`（source-available，非开源协议）。8.1 万浏览（cases.json，2026-10-12 快照）。
- [A.I.Warper](https://x.com/AIWarper/status/2109060856466264566) - 用 REA + Opus 5.5 把自己买过的一款 Steam 游戏反编译成 C#，不到 30 分钟在 Unity 里跑起来。约 46.7 万浏览（数字仅见于本 README，未经核实）。
- [Vaibhav Sisinty：这周大家用它做了什么](https://x.com/VaibhavSisinty/status/2109618846453977359) - 案例盘点串：Steam 游戏反编译、初代 Apple TV 遥控器、空调遥控、LG 电视 Plex 客户端等。其中部分原帖没有写明用了 REA，属于同一波「AI 逆向」热潮。
- [alex funk：45 分钟逆向初代 Apple TV 遥控器](https://x.com/alexzfunk/status/2108585025205592408) - 「software is kinda solved」，让 Siri Remote 通过蓝牙在 Linux 上工作，开源为 [a-funk/open-appleremote](https://github.com/a-funk/open-appleremote)。帖子和 README 都没有提到 REA。
- [Ilter Canberk：逆向自家空调](https://x.com/icanberk/status/2109031477484937571) - 逆向空调的控制方式后 vibe coding 了一个菜单栏小应用，后来又用 Codex 移植到智能眼镜。原帖未提及 REA；另有一条转述（[空调 + AR 眼镜](https://x.com/justhalfbit/status/2109524402765488499)）称用了 REA，两种说法有分歧，标为 Claim?。
- [PlxNative：LG 电视原生 Plex 客户端](https://github.com/GLinnik21/plx-native)（经 [Vaibhav Sisinty 转述](https://x.com/VaibhavSisinty/status/2108103450995417177)）- 作者 GLinnik21 用 Ghidra + Claude Code 研究电视原生媒体栈，做出 Rust/OpenGL 客户端。约 7,268 赞是转述帖的数字，"30 秒到 3 秒"指用户选择界面，不是启动时间。

### 更多用户实战案例

以下都是作者在 X 上自述用 REA 做的事，多数没有公开代码，也没经过独立验证，阅读时请留意边界。

**应用与功能复刻**

- [宝玉：Codex 浏览器的评论框](https://x.com/dotey/status/2109417222724600172) - 🇨🇳 分析 Electron 代码，找到网页唤起并预填评论框的接口；作者说明还不能直接把评论附加到输入框。
- [macOS 预览：有无 REA 的对比](https://x.com/maheshboda006/status/2109154423712977359) - 同一作者分别用有 REA 和没有 REA 的方式重建缩放、旋转、标注和保存功能。
- [CapCut：做自己的视频编辑器](https://x.com/Mehal_Kay/status/2109665456735076494) - REA + Claude Code 重建字幕、转场、动画和文字功能，仍在进行中。
- [剪映：让 Codex 调用原生编辑命令](https://x.com/gkxspace/status/2109644222978744682) - 🇨🇳 分析剪映后让 Codex 驱动它的编辑命令，作者计划脱敏后开源。
- [ClearSpace：研究 CleanMyMac](https://x.com/iceman_shen/status/2109665812017746132) - 🇨🇳 Codex + REA 研究清理工具，做出原生 Mac 清理应用雏形。
- [Typeless：本地语音输入替代品](https://x.com/i/status/2109971905336037671) - 作者称用 REA 分析 Typeless 后，用 Swift 做了离线运行的语音输入应用。（链接是匿名的 x.com/i/status 地址，作者无法核实。）
- [Screen Studio：复刻录屏演示工具](https://x.com/i/status/2109843188341207283) - 作者称用 REA 拆解 Screen Studio，再用 Claude Code 复刻。（链接是匿名的 x.com/i/status 地址，作者无法核实。）
- [MarkText：重建 HTML 导出](https://x.com/i/status/2109839329933824026) - 用 REA 分析 MarkText 的 HTML 导出并重建，17 项测试通过。（链接是匿名的 x.com/i/status 地址，作者无法核实。）
- [LightBurn：给自己的激光雕刻机做专用控制软件](https://x.com/LIQUID8RPF/status/2109789864891940904) - 作者称 16 分钟做出只针对 LONGER Ray5 的 LightBurn 替代，实机验收未完成。
- [Claude Code：读懂 47MB 压缩 JavaScript](https://x.com/servasyy_ai/status/2108846931183378537) - 🇨🇳 让 Agent 调用 REA 阅读 Claude Code 的大型压缩代码包。
- [二进制库：先分析再重写](https://x.com/leeoxiang/status/2109159806183538768) - 🇨🇳 用 REA 分析一个二进制库后，由 Claude Code 写出替代实现。
- [网站重建](https://x.com/goan999999/status/2109080288823562734) - 🇨🇳 作者自述用 REA 辅助完成网站重建订单。
- [TradingView 复刻流程](https://x.com/RohOnChain/status/2109347169316839434) - 传播较广的复刻流程帖，但没有证据表明恢复了付费指标。

**硬件与设备**

- [智能马桶：从小程序蓝牙协议到 Mac 状态栏遥控器](https://x.com/thinkszyg/status/2109309251533570509) - 🇨🇳 分析微信小程序的蓝牙通信，在电脑上控制马桶翻盖，[后续](https://x.com/thinkszyg/status/2109526361971073103)扩展到家里其他设备。
- [电视控制工作台](https://x.com/i/status/2109842197654692349) - 作者称用 REA 逆向电视，在电脑上实现输入切换、音量、遥控和屏幕镜像。（链接是匿名的 x.com/i/status 地址，作者无法核实。）
- [Homatics 电视盒子：修复 Dolby Vision 偏色](https://x.com/qwerty__cs/status/2109722857207115879) - 研究固件，修复升级 Android TV 14 后的绿屏偏色问题。
- [蓝牙小手柄设置程序](https://x.com/corndogjpn2/status/2109289076243525916) - 协议已逆向，跨平台设置程序还在计划中。
- [Elgato 4K X 采集卡](https://x.com/talkaboutdesign/status/2109795113807630735) - 开始研究采集卡，目标是更好的性能和更低的延迟。

**游戏**

- [《航空霸业 2》](https://x.com/TSFisher24nrex/status/2109452544913326086) - 用 REA + Kimi 研究 KOEI 1993 年的航空经营游戏。
- [跑酷游戏的加速规则（HTTP t-rex 页面）](https://x.com/0xlangeai/status/2109595393260761111) - 🇨🇳 作者用 REA + Codex 复刻，并发布原版、官方案例版和自制版的并排对比视频。注意：官方的恐龙案例见 [morluto/rea PR #1203](https://github.com/morluto/rea/pull/1203)，不是这条。

**评测与对照实验**

- [Codex 有无 REA 的对照](https://x.com/0xlangeai/status/2109603485914206498) - 🇨🇳 三个自制样本、六次运行、360 个用例验收，关注 REA 提供线索的价值，而不是速度排名。

### 介绍与传播

- [Matthew Berman](https://x.com/MatthewBerman/status/2108245653843509415) - 「Reverse Engineer Anything 😂 Software is done.」引发大规模传播的帖子之一。
- [0xMarioNawfal](https://x.com/RoundtableSpace/status/2109165852578992582) - 「Closed source is dead」，单日 2.5 万 Star 时的介绍，约 92 万浏览。更早的一条[功能介绍](https://x.com/RoundtableSpace/status/2107059472753664261)发于 10 月 5 日。
- [International Cyber Digest](https://x.com/IntCyberDigest/status/2108699960782774733) - GitHub Trending 第一时的介绍：「Software is dead, long live software!」
- [Trending GitHub Repositories](https://x.com/trending_repos/status/2107443007217701076) - 当日趋势仓库播报，24 小时新增约 3,000 Star。
- [Rohan Paul](https://x.com/rohanpaul_ai/status/2108423886509683053) - 功能概览：一个 MCP 覆盖二进制、应用和运行时行为。
- [Tech with Mak](https://x.com/techNmak/status/2108431092462338178) - 「有人给 Claude Code 装了个反编译器」，介绍它如何把 Agent 接到 Ghidra、Hopper 等工具。
- [Hasan Toor](https://x.com/hasantoxr/status/2108524682727305344) - 「把任何应用交给 AI，让它重建里面最好的功能」。
- [Larry Cheng](https://x.com/larryvc/status/2109344654198018095) - 风险投资人视角的一句话介绍：看一个成品应用，不看源码就弄清它怎么工作。
- [Afiz](https://x.com/itsafiz/status/2107063919290573174) - 「看到喜欢的功能，就让 Agent 逆向它」，强调 100% 本地运行。
- [Oliver Prompts](https://x.com/oliviscusAI/status/2106955446183411895) - 反编译、追踪执行、检查运行时行为的功能介绍。
- [K2S](https://x.com/k2sbhai/status/2106796616716062777) - 四步上手：安装、`rea setup`、连接 Agent、给它一个要调查的功能。
- [Vaishnavi](https://x.com/_vmlops/status/2106690704244420687) - 早期介绍帖。
- [Dan Kornas](https://x.com/DanKornas/status/2106032461968761052) - 10 月 2 日的介绍，是走红前最早的几条之一，逐条列出证据记录、本地分析等特性。
- [CyrilXBT](https://x.com/cyrilXBT/status/2109490499321299364) - 「闭源以前意味着受保护，现在只意味着抄得慢一点」，夸张口吻的代表。
- [darkzodchi](https://x.com/zodchiii/status/2109736071827476756) - REA + Claude Code 的上手长文：拿来读没文档的仓库、没公开 API 的应用和丢了源码的旧 .exe。
- [X 趋势话题页](https://x.com/i/trending/2108302228461080603) - X 官方聚合的「REA GitHub 工具让 AI 从二进制逆向应用功能」话题。

### 中文、日文及其他语言

- [宝玉：REA 让 AI 智能体帮你逆向没有源码的软件](https://x.com/dotey/status/2108794629172682783) - 🇨🇳 最完整的中文介绍：安装、能分析什么、三个官方案例、数据去向，以及合规和「REA 没有发币」的提醒。约 30 万浏览。
- [lifcc](https://x.com/mylifcc/status/2108940999527690525) - 🇨🇳「一个开源项目一天暴涨 2 万多 Star」，讨论以后可以直接让 Claude Code 或 Codex 研究二进制、重建功能。
- [婷](https://x.com/shijianzhongg/status/2107979591348543520) - 🇨🇳「GitHub 上今天的爆火开源项目」，列出挖隐藏功能、查后门、学大厂思路三种用法。约 17 万浏览。
- [TechVerser](https://x.com/realfxw/status/2106734209473581308) - 🇨🇳「AI 正在彻底重塑底层逆向工程的游戏规则」，介绍 REA 把逆向工具链封装成 Agent 外挂的思路。
- [Khazix](https://x.com/Khazix0918/status/2109501787736813663) - 🇨🇳「AI 开始逆向一切，你电脑里的每个软件都要被迫开源了」。
- [xiangxiang103 的 REA 案例合集](https://x.com/xiangxiang103/status/2109813885641576795) - 🇨🇳 X 上整理的一批用户案例。
- [吉川孝志（《マルウエアの教科書》作者）](https://x.com/MalwareBibleJP/status/2108736281647931717) - 🇯🇵 从恶意软件分析和防御方的角度逐条整理依赖工具、静态与运行时分析的区别、数据去向和合规声明。
- [midudev](https://x.com/midudev/status/2107834472091598854) - 🇪🇸「所有人都在用 AI 逆向程序和游戏」，西语开发者圈传播最广的一条，约 15 万浏览。
- [bearstech](https://x.com/bearstech/status/2109679666105655457) / [actu_ia](https://x.com/actu_ia/status/2107107539485958502) - 🇫🇷 法语简介。

### 官方账号

- [@morluto](https://x.com/morluto) - REA 作者。[rea 6.4 发布](https://x.com/morluto/status/2109138696008327226)：「快了很多」，并分享了用来做性能分析的 [morluto/flameox](https://github.com/morluto/flameox)。
- [@reatools](https://x.com/reatools) - 官方账号，转发了作者那句「the homebrew computer club era of technology is back」。

### 同期的开源项目盘点帖

REA 常和其他爆火仓库一起出现在「开源替代付费软件」类的盘点里。

- [brenz.](https://x.com/brenzhills/status/2108983461230845978) - 🇪🇸「这个月正在爆发的 10 个仓库」，REA 排第 4，同列的有 VoiceStudio、ppt-master、gods-eye-view、diagram-design、paperclip。
- [Chris Pirillo](https://x.com/ChrisPirillo/status/2109843806187303400) - 10 月 12 日的 Vibe Coding 与 AI 新闻汇总，REA 与 context-mode、diagram-design 等并列。
- [govin.eth｜G哥](https://x.com/goan999999/status/2109544711400857688) - 🇨🇳「GitHub 上这 6 个开源神器，付费软件的好日子要到头了」：PPT Master、VoiceStudio、God's Eye View、Diagram Design、Paperclip、ECC。没有提到 REA，但和上面两条是同一批项目、同一种叙事。

### 争议

- [codila](https://x.com/0xCodila/status/2109623431763292649) - 「REA is most dangerous thing on the internet right now」，宣扬用它免费复刻付费功能，是争议的典型代表（见下文）。
- [刘小排](https://x.com/bourneliu66/status/2109882364705038422) - 🇨🇳「REA 只是一个 Hype」：认为它不是新的逆向技术，只是帮 Agent 调用已有工具，被自媒体过度炒作。很有代表性的反方观点。
- [Jaden Williams](https://x.com/JadenJTW/status/2106890896981508329) - 转发早期介绍帖时只写了一句「God help us all.」
