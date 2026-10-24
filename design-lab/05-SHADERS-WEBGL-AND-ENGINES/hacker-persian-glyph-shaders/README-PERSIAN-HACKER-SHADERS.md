# Persian Hacker & Kinetic Glyph Shaders — WebGL Architecture (10×8 Search Synthesis)

## 1. Real Persian Glyph Atlas in WebGL (`u_glyphTex`)
Rather than relying on synthetic procedural pseudo-runes alone, `src/components/ShaderSurface.tsx` generates a 512×512 (`8×8 = 64 cells`, `64×64px` per cell) high-contrast Canvas 2D texture atlas and binds it to `gl.TEXTURE0` (`uniform sampler2D u_glyphTex`):
- **Cells `0..31`:** All 32 Persian alphabet letters (`آ ب پ ت ث ج چ ح خ د ذ ر ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ه ی`)
- **Cells `32..41`:** All 10 Persian digits (`۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹`)
- **Cells `42..55`:** 14 Persian calligraphic & hacker short words (`نور`, `خط`, `جان`, `کد`, `رمز`, `حق`, `هو`, `لا`, `موج`, `شب`, `صفر`, `یک`, `مرز`, `روح`)
- **Cells `56..63`:** 8 Cyber / Hacker terminal symbols (`⌘`, `✦`, `⚡`, `◈`, `∆`, `Ω`, `∑`, `∞`)

## 2. GLSL Prelude Sampler (`persianGlyph`)
```glsl
uniform sampler2D u_glyphTex;

float persianGlyph(vec2 cellUv, float idx) {
  if (cellUv.x < 0.05 || cellUv.x > 0.95 || cellUv.y < 0.05 || cellUv.y > 0.95) return 0.0;
  float k = floor(mod(abs(idx), 64.0));
  float col = mod(k, 8.0);
  float row = floor(k / 8.0);
  vec2 uv = (vec2(col, row) + vec2(cellUv.x, 1.0 - cellUv.y)) / 8.0;
  return texture2D(u_glyphTex, uv).r;
}
```

## 3. The 8 Hacker & Persian Glyph Shaders (`src/engines/shaderLab.ts`)
1. **`persian-matrix-rain` (`باران ماتریکس حروف فارسی`):** 3-layer parallax digital rain (`far`, `mid`, `near`) with stateless drop reset math (`astralvoid2/matrixdemo1`), white-mint leading head, emerald/gold phosphor trail, and oracle highlights.
2. **`cyber-corridor-3d` (`دالان سه‌بعدی ماتریکس فارسی`):** 6-plane volumetric raymarched 3D hallway of falling Persian glyph streams (`0xhckr/ghostty-shaders/inside-the-matrix.glsl`) with perspective grid floor reflection.
3. **`crt-hacker-terminal` (`ترمینال هکری CRT و گلیچ حروف`):** Barrel CRT curvature (`1.0 + 0.1 * dot(p,p)`), horizontal sync glitch tears, RGB chromatic aberration split, active typing terminal rows, and crimson cyber-virus outbreak blocks.
4. **`persian-kinetic-vortex` (`گرداب تایپوگرافی جنبشی فارسی`):** Counter-rotating concentric polar rings of Persian letters and words orbiting an astrolabe singularity.
5. **`hologram-radar-hud` (`رادار هولوگرافیک و تله‌متری فارسی`):** Rotating cyberpunk sonar sweep (`exp(-diff * 2.6)`), range rings, crosshairs, and Persian telemetry glyphs igniting on radar contact.
6. **`ascii-persian-synth` (`موج پلاسمای حروف فارسی`):** Domain-warped FBM plasma quantized into a real-time mosaic of Persian characters whose glyph index tracks wave luminance.
7. **`neural-cipher-plexus` (`شبکهٔ عصبی و رمزگشایی حروف`):** Animated Voronoi cyber-nodes with glowing laser boundaries and decrypting Persian characters inside each cell nucleus.
8. **`neon-calligraphy-laser` (`اسطرلاب لیزری و حروف نئون`):** 12-fold sacred Persian Girih laser star surrounded by an orbiting halo of neon Persian glyphs.
