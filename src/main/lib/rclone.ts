import once from 'licia/once'
import childProcess, { ChildProcessByStdio } from 'node:child_process'
import { Readable } from 'node:stream'
import { handleEvent, resolveResources } from 'share/main/lib/util'
import getPort from 'licia/getPort'
import log from 'share/common/log'
import { app, session } from 'electron'
import isMac from 'licia/isMac'
import isWindows from 'licia/isWindows'
import randomId from 'licia/randomId'
import btoa from 'licia/btoa'
import { getMainStore, getSettingsStore } from './store'
import fs from 'fs-extra'
import isStrBlank from 'licia/isStrBlank'
import path from 'path'
import * as rclone from '../../common/rclone'
import some from 'licia/some'

const logger = log('rclone')

const settingsStore = getSettingsStore()
const mainStore = getMainStore()

let port = 5572
const user = 'rem'
const pass = randomId()
let isDead = false
let subprocess: ChildProcessByStdio<null, Readable, Readable>

export async function start() {
  init()
  initRpc()

  const rclonePath = getRclonePath()

  port = await getPort(port, '127.0.0.1')

  const args = [
    'rcd',
    '--rc-serve',
    '--rc-addr',
    `127.0.0.1:${port}`,
    '--rc-user',
    user,
    '--rc-pass',
    pass,
    '--rc-job-expire-duration',
    `24h`,
  ]

  const configPath = settingsStore.get('configPath')
  if (!isStrBlank(configPath)) {
    args.push('--config', configPath)
  }

  subprocess = childProcess.spawn(rclonePath, args, {
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  })
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))
  subprocess.on('exit', (code, signal) => {
    logger.info('rclone exit', code, signal)
    isDead = true
  })
  subprocess.on('error', (err) => {
    logger.info('rclone error', err)
    if (!subprocess.pid) {
      isDead = true
    }
  })

  app.on('will-quit', () => subprocess.kill())

  rclone.init(port, btoa(`${user}:${pass}`))

  if (await rclone.wait()) {
    if (settingsStore.get('autoMount')) {
      autoMount()
    }
  }
}

function getRclonePath() {
  let bin = isWindows
    ? resolveResources('rclone/rclone.exe')
    : resolveResources('rclone/rclone')
  const rclonePath = settingsStore.get('rclonePath')
  if (
    rclonePath === 'rclone' ||
    (!isStrBlank(rclonePath) && fs.existsSync(rclonePath))
  ) {
    bin = rclonePath
  }
  return bin
}

async function openRcloneCli() {
  let cwd = resolveResources('rclone')
  const rclonePath = settingsStore.get('rclonePath')
  if (!isStrBlank(rclonePath) && fs.existsSync(rclonePath)) {
    cwd = path.dirname(rclonePath)
  }

  if (isMac) {
    const child = childProcess.spawn('open', ['-a', 'Terminal', cwd], {
      stdio: 'ignore',
    })
    child.unref()
  } else if (isWindows) {
    const child = childProcess.exec('start cmd', {
      cwd,
    })
    child.unref()
  } else {
    const child = childProcess.spawn('x-terminal-emulator', ['-w', cwd], {
      stdio: 'ignore',
    })
    child.unref()
  }
}

async function autoMount() {
  const mounts = mainStore.get('mounts') || []
  const mountedMounts = await rclone.listMounts()
  for (let i = 0, len = mounts.length; i < len; i++) {
    const mount = mounts[i]
    if (
      some(
        mountedMounts,
        (m) => m.Fs === mount.fs && m.MountPoint === mount.mountPoint
      )
    ) {
      continue
    }

    try {
      logger.info('auto mount', mount.fs, mount.mountPoint)
      await createMount(mount.fs, mount.mountPoint)
      logger.info('auto mount success', mount.fs, mount.mountPoint)
    } catch {
      logger.error('auto mount failed', mount.fs, mount.mountPoint)
    }
  }
}

async function createMount(mountFs: string, mountPoint: string) {
  if (fs.existsSync(mountPoint)) {
    if (isWindows) {
      const stats = await fs.stat(mountPoint)
      if (stats.isDirectory()) {
        const files = await fs.readdir(mountPoint)
        if (files.length === 0) {
          await fs.rmdir(mountPoint)
        }
      }
    }
  } else {
    if (!isWindows) {
      await fs.mkdir(mountPoint, { recursive: true })
    }
  }
  await rclone.createMount(mountFs, mountPoint)
}

const init = once(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ['http://127.0.0.1:*/*'],
    },
    (details, callback) => {
      details.requestHeaders['Authorization'] = `Basic ${btoa(
        `${user}:${pass}`
      )}`
      callback({ requestHeaders: details.requestHeaders })
    }
  )
})

const initRpc = once(() => {
  handleEvent('getRclonePort', () => port)
  handleEvent('getRcloneAuth', () => btoa(`${user}:${pass}`))
  handleEvent('isRcloneRunning', () => !isDead)
  handleEvent('openRcloneCli', openRcloneCli)
})
