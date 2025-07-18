import { app } from 'electron'
import { getSettingsStore } from './store'
import memoize from 'licia/memoize'
import isMac from 'licia/isMac'
import parseArgs from 'licia/parseArgs'

const settingsStore = getSettingsStore()

const LOGIN_SETTING_OPTIONS = {
  args: ['--opened-at-login=1'],
}

export const wasOpenedAtLogin = memoize(function () {
  if (isMac) {
    return app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).wasOpenedAtLogin
  }

  const args = parseArgs(process.argv, {
    names: {
      openedAtLogin: 'number',
    },
    shorthands: {},
  })

  return args.openedAtLogin === 1
})

export function isEnabled() {
  return app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
}

export function init() {
  settingsStore.set('openAtLogin', isEnabled())

  settingsStore.on('change', (key, value) => {
    if (key === 'openAtLogin') {
      if (value) {
        if (isEnabled()) {
          return
        }
        app.setLoginItemSettings({
          openAtLogin: value,
          ...LOGIN_SETTING_OPTIONS,
        })
      } else {
        app.setLoginItemSettings({
          openAtLogin: false,
        })
      }
    }
  })
}
