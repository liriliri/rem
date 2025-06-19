import path from 'node:path'
import normalizePath from 'licia/normalizePath.js'
import last from 'licia/last.js'
import fs from 'fs-extra'
import isWindows from 'licia/isWindows.js'

const rcloneDir = resolve(__dirname, '../rclone')

await fs.ensureDir(rcloneDir)

const version = '1.69.3'
const downloadUrl = `https://github.com/rclone/rclone/releases/download/v${version}/rclone-v${version}-${
  isWindows ? 'windows-amd64' : 'osx-arm64'
}.zip`
const rcloneName = last(downloadUrl.split('/'))
const rclonePath = `${rcloneDir}/${rcloneName}`
await $`curl -Lk ${downloadUrl} -o ${rclonePath}`
await $`unzip -o ${rclonePath} -d ${rcloneDir}`
await fs.remove(rclonePath)

let files = ['rclone']
if (isWindows) {
  files = ['rclone.exe']
}
for (let i = 0, len = files.length; i < len; i++) {
  const file = files[i]
  await fs.copy(
    resolve(`${rclonePath.replace('.zip', '')}/${file}`),
    resolve(`${rcloneDir}/${file}`)
  )
}

await fs.remove(`${rclonePath.replace('.zip', '')}`)

function resolve(...args) {
  return normalizePath(path.resolve(...args))
}
