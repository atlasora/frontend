import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  envDir: '../../',
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      containers: path.resolve(__dirname, './src/containers'),
      context: path.resolve(__dirname, './src/context'),
      library: path.resolve(__dirname, './src/library'),
      settings: path.resolve(__dirname, './src/settings'),
      themes: path.resolve(__dirname, './src/themes'),
    },
  },
  server: {
    // 👇 This is correct Vite usage (from Connect middleware under the hood)
    fs: {
      allow: ['.'],
    },
  },
  build: {
    outDir: 'build',
  },
  define: {
    global: 'window',
  },
});
