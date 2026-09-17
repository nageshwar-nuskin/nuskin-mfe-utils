import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    '@contentstack/delivery-sdk',
    '@contentstack/live-preview-utils',
    '@contentstack/utils',
  ],
  platform: 'neutral',
});
