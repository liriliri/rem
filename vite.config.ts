import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import path from 'path'

export default defineConfig(async (): Promise<UserConfig> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const pkg = await fs.readJSON(path.resolve(__dirname, 'package.json'))
  return {
    base: '',
    plugins: [react()],
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          app: './index.html',
        },
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    server: {
      hmr: false,
      port: 8080,
    },
    define: {
      ECHO_VERSION: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        share: path.resolve(__dirname, 'src/share'),
      },
    },
  }
})
