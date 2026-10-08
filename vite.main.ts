import { defineConfig, UserConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'node:module'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { alias } from './vite.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const builtins = builtinModules.filter((e) => !e.startsWith('_'))
builtins.push('electron', ...builtins.map((m) => `node:${m}`))

export default defineConfig(async (): Promise<UserConfig> => {
  const pkg = await fs.readJSON(path.resolve(__dirname, 'package.json'))
  const external = [...builtins, ...Object.keys(pkg.dependencies || {})]
  return {
    build: {
      outDir: 'dist/main',
      lib: {
        entry: resolve(__dirname, 'src/main/index.ts'),
        name: 'Main',
        fileName: 'index',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: (id) =>
          external.some((name) => id === name || id.startsWith(name + '/')),
      },
    },
    resolve: {
      mainFields: ['main', 'module'],
      alias,
    },
    define: {
      PRODUCT_NAME: JSON.stringify(pkg.productName),
      VERSION: JSON.stringify(pkg.version),
    },
  }
})
