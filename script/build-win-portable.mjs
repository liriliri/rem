import path from 'node:path'
import { fileURLToPath } from 'node:url'
import builder from 'electron-builder'
import fs from 'fs-extra'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const outputDir = `release/portable-${Date.now()}`

async function prepareDistPackage() {
  const pkg = await fs.readJson(path.join(root, 'package.json'))

  const distPkg = {
    name: pkg.name,
    productName: pkg.productName,
    appId: pkg.appId,
    version: pkg.version,
    description: pkg.description,
    main: 'main/index.js',
    author: pkg.author,
    license: pkg.license,
  }

  await fs.ensureDir(distDir)
  await fs.copy(path.join(root, 'build'), path.join(distDir, 'build'))
  await fs.copy(path.join(root, 'resources'), path.join(distDir, 'resources'))
  await fs.writeJson(path.join(distDir, 'package.json'), distPkg, { spaces: 2 })
}

async function buildPortableExe() {
  await prepareDistPackage()

  console.log(`Packaging output: ${outputDir}`)

  await builder.build({
    publish: 'never',
    config: {
      appId: 'io.liriliri.rem',
      artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
      directories: {
        app: 'dist',
        output: outputDir,
      },
      files: ['main/**', 'preload/**', 'renderer/**'],
      extraResources: {
        from: 'resources',
        to: './',
        filter: ['**/*'],
      },
      win: {
        target: [{ target: 'portable', arch: ['x64'] }],
        signAndEditExecutable: false,
      },
    },
    projectDir: root,
  })
}

await buildPortableExe()
