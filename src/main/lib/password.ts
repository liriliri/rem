import * as window from 'share/main/lib/window'
import { getRclonePath } from './rclone'
import { getSettingsStore } from './store'
import isStrBlank from 'licia/isStrBlank'
import childProcess from 'node:child_process'
import contain from 'licia/contain'
import noop from 'licia/noop'
import { handleEvent } from 'share/main/lib/util'
import { IpcValidatePassword } from 'common/types'
import log from 'share/common/log'

const logger = log('password')
const settingsStore = getSettingsStore()

export async function checkPassword() {
  if (await isConfigEncrypted()) {
    const password = await promptPassword()
    if (!password) {
      return false
    }
    process.env.RCLONE_CONFIG_PASS = password
    return true
  }

  return true
}

async function promptPassword(): Promise<string | null> {
  return new Promise((resolve) => {
    const win = window.create({
      name: 'password',
      width: 400,
      height: 150,
      resizable: false,
      onSavePos: noop,
    })

    win.on('close', () => {
      resolve(null)
      win.destroy()
    })

    window.loadPage(win, {
      page: 'password',
    })

    handleEvent('validatePassword', <IpcValidatePassword>(async (password) => {
      const isValid = !(await isConfigEncrypted(password))

      if (isValid) {
        resolve(password)
        win.close()
      }

      return isValid
    }))

    handleEvent('closePassword', () => win.close())
  })
}

function isConfigEncrypted(password?: string): boolean {
  const configPath = settingsStore.get('configPath')

  try {
    const args = ['config', 'show', '--ask-password=false']
    const rclonePath = getRclonePath()
    if (!isStrBlank(configPath)) {
      args.push('--config', configPath)
    }
    const env = {
      ...process.env,
    }
    if (password) {
      env.RCLONE_CONFIG_PASS = password
    }

    childProcess.execSync(`"${rclonePath}" ${args.join(' ')}`, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    return false
  } catch (e: any) {
    const stderr = e.stderr ? e.stderr.toString() : ''
    if (contain(stderr, 'unable to decrypt configuration')) {
      return true
    }

    if (!password && !isStrBlank(configPath)) {
      logger.warn(
        'failed to load custom config, fallback to default',
        configPath,
        stderr.trim()
      )
      settingsStore.set('configPath', '')
      return isConfigEncrypted()
    }

    return false
  }
}
