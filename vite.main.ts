import { defineConfig, UserConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'node:module'
import fs from 'fs-extra'
import path from 'path'

const builtins = builtinModules.filter((e) => !e.startsWith('_'))
builtins.push('electron', ...builtins.map((m) => `node:${m}`))

export default defineConfig(async (): Promise<UserConfig> => {
  const pkg = await fs.readJSON(path.resolve(__dirname, 'package.json'))
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
        external: builtins,
      },
    },
    resolve: {
      mainFields: ['main', 'module'],
      alias: {
        share: resolve(__dirname, 'src/share'),
      },
    },
    define: {
      PRODUCT_NAME: JSON.stringify(pkg.productName),
      VERSION: JSON.stringify(pkg.version),
    },
  }
})
