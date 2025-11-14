import {
  app,
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
} from 'electron'
import { resolveResources } from 'share/main/lib/util'
import * as main from '../window/main'
import * as mount from '../window/mount'
import * as job from '../window/job'
import isMac from 'licia/isMac'
import * as settings from '../window/settings'
import { t } from 'common/util'
import * as rclone from 'common/rclone'
import map from 'licia/map'
import isEmpty from 'licia/isEmpty'
import log from 'share/common/log'

const logger = log('tray')
let tray: Tray | null = null

export function init() {
  const iconPath = isMac ? 'tray-template.png' : 'tray.png'
  const icon = nativeImage.createFromPath(resolveResources(iconPath))
  if (isMac) {
    icon.setTemplateImage(true)
  }
  tray = new Tray(icon)
  tray.setToolTip(`${PRODUCT_NAME} ${VERSION}`)
  tray.on('click', () => {
    updateContextMenu()
    if (!isMac) {
      if (!main.showFocusedWin()) {
        main.showWin()
      }
    }
  })
  tray.on('right-click', updateContextMenu)

  updateContextMenu()
  rclone.wait().then((result) => {
    if (result) {
      updateContextMenu()
    }
  })
}

async function updateContextMenu() {
  if (!tray) {
    return
  }

  logger.info('update context menu')

  let configMenu: MenuItemConstructorOptions[] = []
  try {
    const configDump = await rclone.getConfigDump()
    configMenu = map(configDump, (_, name) => {
      return {
        label: name,
        click() {
          main.newWin(name)
        },
      }
    })
  } catch {
    // ignore
  }
  const openMenu: MenuItemConstructorOptions[] = !isEmpty(configMenu)
    ? [
        {
          label: t('open'),
          submenu: configMenu,
        },
      ]
    : []

  const hideMenu: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: t('hideRem'),
          role: 'hide',
        },
      ]
    : []
  const contextMenu = Menu.buildFromTemplate([
    {
      label: t('show'),
      click() {
        if (!main.showFocusedWin()) {
          main.showWin()
        }
      },
    },
    ...openMenu,
    ...hideMenu,
    {
      type: 'separator',
    },
    {
      label: t('mountManager'),
      click() {
        mount.showWin()
      },
    },
    {
      label: t('jobManager'),
      click() {
        job.showWin()
      },
    },
    {
      label: `${t('settings')}...`,
      click() {
        settings.showWin()
      },
    },
    {
      type: 'separator',
    },
    {
      label: t('quitRem'),
      click() {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}
