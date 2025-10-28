import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: mode === 'production' ? './' : '/',
    plugins: [react()],
    define: {
      'import.meta.env': JSON.stringify(env)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    },
    server: {
      port: 3000,
      host: true,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development'
    }
  };
});
