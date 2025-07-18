import { app } from 'electron'
import * as menu from './lib/menu'
import * as tray from './lib/tray'
import * as ipc from './lib/ipc'
import * as main from './window/main'
import * as language from 'share/main/lib/language'
import * as theme from 'share/main/lib/theme'
import * as terminal from 'share/main/window/terminal'
import * as rclone from './lib/rclone'
import * as autoLaunch from './lib/autoLaunch'
import { setupTitlebar } from 'custom-electron-titlebar/main'
import log from 'share/common/log'
import * as updater from 'share/main/lib/updater'
import isMac from 'licia/isMac'

const logger = log('main')
logger.info('start')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Rem')

app.on('ready', () => {
  logger.info('app ready')

  setupTitlebar()
  autoLaunch.init()
  terminal.init()
  language.init()
  theme.init()
  ipc.init()
  rclone.start()
  if (!autoLaunch.wasOpenedAtLogin()) {
    main.showWin()
  }
  menu.init()
  tray.init()
  updater.init()
})

app.on('window-all-closed', () => {
  logger.info('all windows closed')
  if (isMac) {
    app.dock.hide()
  }
})

app.on('browser-window-created', () => {
  if (isMac) {
    app.dock.show()
  }
})
