# @pinkney/synth-sound

> 🔊 Zero-audio-file, ultra-lightweight Web Audio API mathematical sound synthesizer for modern web apps & cyber UI.  
> 零外部音频文件依赖、纯基于浏览器震荡器与指数包络线实时数学合成的极客微交互音效引擎。

[![npm version](https://img.shields.io/npm/v/@pinkney/synth-sound.svg?style=flat-square)](https://www.npmjs.com/package/@pinkney/synth-sound)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@pinkney/synth-sound?style=flat-square)](https://bundlephobia.com/package/@pinkney/synth-sound)

---

## ✨ Features (核心亮点)

- 🪶 **0 KB Audio Assets (零音频静态资源)**: 无需加载任何 `.mp3` / `.wav` 文件，零网络请求、零带宽开销、零版权顾虑。
- ⚡ **Zero-Latency Mathematical Sound (纯数学合成零延迟)**: 直接使用浏览器的 `AudioContext.createOscillator()` 生成正弦波、三角波、锯齿波，响应延迟 < 1ms。
- 🛡️ **Anti-Pop Envelope (指数级防爆音包络)**: 精确的 `exponentialRampToValueAtTime` 增益控制，彻底杜绝音频开始与结束时的破音杂音 (Pop/Click)。
- 🌐 **Framework Agnostic (通用多端)**: 纯 TypeScript 编写，无任何 UI 库强绑定！可在 **React**、**Vue**、**Svelte**、**Next.js** 或**原生网页**中即插即用。
- 🔇 **Built-in Mute & Persistence (内置静音记忆)**: 开箱支持全局一键静音，并自动将用户偏好记忆在 `localStorage` 中。

---

## 📦 Installation (安装)

```bash
npm install @pinkney/synth-sound
# or
pnpm add @pinkney/synth-sound
# or
yarn add @pinkney/synth-sound
```

---

## 🚀 Quick Start (快速上手)

### 1. Simple Usage (最简调用)

```typescript
import { synthSound } from '@pinkney/synth-sound';

// 鼠标悬浮
synthSound.playHover();

// 按钮点击
synthSound.playClick();

// 操作成功 (C-E-G-C 上行四音琶音)
synthSound.playSuccess();

// 警报/错误阻断
synthSound.playWarning();

// 赛博机械打字音
synthSound.playKey();
```

### 2. React Button & Card Example (React 实战示例)

```tsx
import React from 'react';
import { synthSound } from '@pinkney/synth-sound';

export const CyberButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({
  children,
  onClick,
}) => {
  return (
    <button
      onMouseEnter={() => synthSound.playHover()}
      onClick={() => {
        synthSound.playClick();
        onClick?.();
      }}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: '#0e7490',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};
```

---

## 🛠️ API Reference (API 矩阵)

| 方法名 | 参数 | 描述 |
| :--- | :--- | :--- |
| `playHover(freq?, duration?)` | `freq=800, duration=0.02` | 极其清脆短促的悬浮触碰微音效 |
| `playClick(freq?, duration?)` | `freq=600, duration=0.04` | 实体微动按键物理反馈音 |
| `playKey()` | 无 | 机械键盘敲击音（内部自动随机多频三角波混音） |
| `playSuccess()` | 无 | 四音阶多和弦上行琶音（操作成功/保存完成） |
| `playWarning()` | 无 | 双频交替锯齿波警示音（报错/阻断） |
| `playWindowOpen()` | 无 | 窗口升起展开扫频音 |
| `playWindowClose()` | 无 | 窗口收起淡出音 |
| `playLaser(pulses?)` | `pulses=3` | 赛博高能脉冲激光束扫射音 |
| `playCustom(options)` | `PlayCustomOptions` | 自定义波形、起止频率与持续时间合成 |
| `toggleMute()` | 无 | 切换全局静音状态并持久化 |
| `setMuted(boolean)` | `boolean` | 显式设定静音状态 |
| `setMasterVolume(number)`| `0.0 ~ 1.0` | 设置全局音量缩放倍率 |

---

## 📄 License

MIT © [Pinkney Jiang](https://github.com/pinkney)
