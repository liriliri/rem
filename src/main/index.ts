import { app } from 'electron'
import * as menu from './lib/menu'
import * as tray from './lib/tray'
import * as ipc from './lib/ipc'
import * as main from './window/main'
import * as terminal from 'share/main/window/terminal'
import * as rclone from './lib/rclone'
import * as autoLaunch from 'share/main/lib/autoLaunch'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'
import isMac from 'licia/isMac'
import { checkPassword } from './lib/password'
import { getSettingsStore } from './lib/store'
import 'share/main'

const logger = log('main')
logger.info('start', process.argv)

const settingsStore = getSettingsStore()
window.setDefaultOptions({
  customTitlebar: !settingsStore.get('useNativeTitlebar'),
})

app.on('ready', async () => {
  logger.info('app ready')

  autoLaunch.init()
  terminal.init()
  ipc.init()
  if (!(await checkPassword())) {
    app.quit()
    return
  }
  rclone.start()
  if (!autoLaunch.wasOpenedAtLogin() && !settingsStore.get('silentStart')) {
    main.showWin()
  }
  menu.init()
  tray.init()

  function showWin() {
    if (!main.showFocusedWin()) {
      main.showWin()
    }
  }
  if (isMac) {
    app.on('activate', showWin)
  } else {
    app.on('second-instance', showWin)
  }
})

app.on('window-all-closed', () => {
  if (isMac) {
    app.dock.hide()
  }
})
app.on('browser-window-created', () => {
  if (isMac) {
    app.dock.show()
  }
})
