import { app } from 'electron'
import { getSettingsStore } from './store'
import memoize from 'licia/memoize'
import isMac from 'licia/isMac'
import contain from 'licia/contain'

const settingsStore = getSettingsStore()

const OPENED_AT_LOGIN_ARG = '--opened-at-login=1'
const LOGIN_SETTING_OPTIONS = {
  args: [OPENED_AT_LOGIN_ARG],
}

export const wasOpenedAtLogin = memoize(function () {
  if (isMac) {
    return app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).wasOpenedAtLogin
  }

  return contain(process.argv, OPENED_AT_LOGIN_ARG)
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
