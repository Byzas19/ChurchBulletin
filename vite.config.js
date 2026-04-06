import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile()],
  build: {
    target: 'es2015',
    outDir: '../dist',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
  },
});
