import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    sourcemap: true,
    outDir: 'dist',
    external: ['react', 'react-dom', 'react-dom/client'],
    platform: 'browser',
    esbuildOptions(options) {
        options.jsx = 'automatic';
    }
});
