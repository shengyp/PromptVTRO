import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// Java backend: 3002. For the existing Node backend, set EDUTECH_API_TARGET to http://127.0.0.1:3001.
const proxy = { '/api': { target: process.env.EDUTECH_API_TARGET || 'http://127.0.0.1:3002', proxyTimeout: 600000 } }
export default defineConfig({
  plugins: [vue()],
  server: { host: '127.0.0.1', proxy },
  preview: { host: '127.0.0.1', port: 4173, proxy }
})
