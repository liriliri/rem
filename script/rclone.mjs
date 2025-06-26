import path from 'node:path'
import normalizePath from 'licia/normalizePath.js'
import last from 'licia/last.js'
import fs from 'fs-extra'
import os from 'node:os'

const rcloneDir = resolve(__dirname, '../rclone')

await fs.ensureDir(rcloneDir)

const version = '1.69.3'
let platform = os.platform()
let arch = os.arch()
let rclonePlatform = ''
let rcloneArch = ''

switch (platform) {
  case 'darwin':
    rclonePlatform = 'osx'
    break
  case 'win32':
    rclonePlatform = 'windows'
    break
  default:
    rclonePlatform = 'linux'
}

switch (arch) {
  case 'arm64':
    rcloneArch = 'arm64'
    break
  case 'arm':
    rcloneArch = 'arm'
    break
  case 'x64':
    rcloneArch = 'amd64'
    break
  case 'ia32':
    rcloneArch = '386'
    break
  default:
    rcloneArch = arch
}

const downloadUrl = `https://github.com/rclone/rclone/releases/download/v${version}/rclone-v${version}-${rclonePlatform}-${rcloneArch}.zip`
const rcloneName = last(downloadUrl.split('/'))
const rclonePath = `${rcloneDir}/${rcloneName}`
await $`curl -Lk ${downloadUrl} -o ${rclonePath}`
await $`unzip -o ${rclonePath} -d ${rcloneDir}`
await fs.remove(rclonePath)

let files = ['rclone']
if (platform === 'win32') {
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
