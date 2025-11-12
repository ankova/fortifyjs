import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['react', 'react-dom', '@fortifyjs/core'],
});
