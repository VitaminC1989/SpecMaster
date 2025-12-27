import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 代理 API 请求到生产环境或本地服务
      '/api': {
        // 选项 1: 代理到生产环境（需要替换为你的 Vercel 部署地址）
        // target: 'https://your-project.vercel.app',

        // 选项 2: 代理到本地 Vercel Dev（需要先运行 vercel dev）
        target: 'http://localhost:3001',

        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  }
})

