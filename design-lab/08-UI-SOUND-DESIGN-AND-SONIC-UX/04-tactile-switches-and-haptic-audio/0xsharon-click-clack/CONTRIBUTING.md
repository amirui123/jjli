# Contributing to click-clack

Thank you for your interest in contributing to `@0xsharon/click-clack`! We welcome contributions, bug reports, and new procedural switch profiles from the mechanical keyboard and web audio community.

---

## Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### 2. Getting Started

```bash
# Clone the repository
git clone https://github.com/0xSHARON/click-clack.git
cd click-clack

# Install development dependencies
npm install

# Run unit tests
npm test

# Build production bundles
npm run build

# Start live TypeScript watch mode
npm run dev
```

---

## Contributing Guidelines

### Submitting a Bug Report
If you run into an audio glitch, browser incompatibility, or unexpected behavior:
1. Check existing [GitHub Issues](https://github.com/0xSHARON/click-clack/issues) to ensure it hasn't already been reported.
2. Open a new issue with:
   - Operating system and browser version (e.g., macOS Sonoma, Chrome 124)
   - Minimal reproduction code or steps
   - Expected vs actual behavior

### Proposing a New Switch Profile
We love adding authentic switch profiles! When proposing a new sound signature:
1. Define the acoustic model in `src/synth.ts`.
2. Keep all synthesis nodes procedural (oscillators, biquad filters, pink noise bursts).
3. Do **NOT** introduce any audio asset files (`.mp3`, `.wav`, base64 strings).
4. Ensure the profile supports both downstroke and upstroke releases (`isRelease`).
5. Add corresponding unit tests in `src/index.test.ts`.

### Coding Standards
- **Zero Runtime Dependencies:** No external runtime dependencies can be added.
- **TypeScript:** Strict type checks (`npm run typecheck`) must pass.
- **Tests:** All Vitest unit tests (`npm test`) must pass before submitting a PR.
- **Performance:** Ensure no per-keystroke garbage collection allocations.

---

## Pull Request Process

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/my-new-switch
   ```
2. Commit your changes with clear, descriptive commit messages.
3. Verify tests and build pass cleanly:
   ```bash
   npm test
   npm run build
   ```
4. Push to your fork and submit a Pull Request to `0xSHARON/click-clack:main`.
5. Maintainers will review your PR and provide constructive feedback.

---

## Code of Conduct

Please treat everyone in the community with respect, kindness, and professionalism.
