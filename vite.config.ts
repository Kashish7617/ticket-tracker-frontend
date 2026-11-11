import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // In development the browser calls /api on the Vite server, which forwards to the
      // ASP.NET Core API. This avoids CORS entirely during local development.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:5080',
          changeOrigin: true,
        },
      },
    },
  };
});
