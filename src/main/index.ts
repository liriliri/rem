import { app } from 'electron'
import * as menu from './lib/menu'
import * as ipc from 'share/main/lib/ipc'
import * as main from './window/main'
import { setupTitlebar } from 'custom-electron-titlebar/main'
import log from 'share/common/log'
import * as updater from 'share/main/lib/updater'

const logger = log('main')
logger.info('start')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.setName('Rin')

app.on('ready', () => {
  logger.info('app ready')

  setupTitlebar()
  ipc.init()
  main.showWin()
  menu.init()
  updater.init()
})
