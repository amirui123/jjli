import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'src/index.ts', 'from-spec': 'src/fromSpec.ts' },
  format: ['esm'],
  platform: 'browser',
  dts: true,
  clean: true,
})
