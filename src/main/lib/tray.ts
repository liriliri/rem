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
import isMac from 'licia/isMac'
import * as settings from '../window/settings'
import { t } from '../../common/util'

export function init() {
  const iconPath = isMac ? 'tray-template.png' : 'tray.png'
  const icon = nativeImage.createFromPath(resolveResources(iconPath))
  if (isMac) {
    icon.setTemplateImage(true)
  }
  const tray = new Tray(icon)
  tray.setToolTip(`${PRODUCT_NAME} ${VERSION}`)
  if (!isMac) {
    tray.on('click', () => {
      if (!main.showFocusedWin()) {
        main.showWin()
      }
    })
  }
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
