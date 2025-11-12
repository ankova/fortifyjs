import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  external: ['@fortifyjs/core', 'zod'], // keep peers/deps unbundled
});
