import isWindows from 'licia/isWindows.js'

const pkg = await fs.readJson('package.json')
const electron = pkg.devDependencies.electron
if (isWindows && pkg.optionalDependencies?.['eris-windrive']) {
  pkg.dependencies['eris-windrive'] = pkg.optionalDependencies['eris-windrive']
}
delete pkg.optionalDependencies
delete pkg.devDependencies
pkg.devDependencies = {
  electron,
}
delete pkg.scripts
pkg.scripts = {
  start: 'electron main/index.js',
}
pkg.main = 'main/index.js'

await $`npm run build:main`
await $`npm run build:preload`
await $`npm run build:renderer`

await fs.copy('build', 'dist/build')
await fs.copy('resources', 'dist/resources')
cd('dist')

await fs.writeJson('package.json', pkg, {
  spaces: 2,
})

await $`npm i --production`
await $`../node_modules/.bin/electron-builder install-app-deps`
