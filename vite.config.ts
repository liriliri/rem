import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const alias = {
  common: path.resolve(__dirname, 'src/common'),
  share: path.resolve(__dirname, 'src/share'),
}

export default defineConfig(async (): Promise<UserConfig> => {
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
    },
    server: {
      hmr: false,
      port: 8080,
      watch: {
        ignored: ['**/node_modules/**', '**/references/**'],
      },
    },
    define: {
      PRODUCT_NAME: JSON.stringify(pkg.productName),
      VERSION: JSON.stringify(pkg.version),
    },
    resolve: {
      alias,
    },
  }
})
