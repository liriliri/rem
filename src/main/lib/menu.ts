import { Menu, MenuItemConstructorOptions, app, shell } from 'electron'
import * as window from 'share/main/lib/window'
import * as terminal from 'share/main/window/terminal'
import isMac from 'licia/isMac'
import { t } from '../../common/util'
import upperCase from 'licia/upperCase'
import isWindows from 'licia/isWindows'
import { handleEvent } from 'share/main/lib/util'
import * as updater from 'share/main/lib/updater'

function getTemplate(): MenuItemConstructorOptions[] {
  const hideMenu = isMac
    ? [
        {
          type: 'separator',
        },
        {
          label: t('hideRin'),
          role: 'hide',
        },
        {
          label: t('hideOthers'),
          role: 'hideothers',
        },
        {
          label: t('showAll'),
          role: 'unhide',
        },
      ]
    : []

  const rin = {
    label: upperCase(app.name),
    submenu: [
      {
        label: t('aboutRin'),
        click() {
          window.sendTo('main', 'showAbout')
        },
      },
      {
        label: `${t('checkUpdate')}...`,
        click() {
          updater.checkUpdate()
        },
      },
      ...hideMenu,
      {
        type: 'separator',
      },
      {
        label: t('quitRin'),
        accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        },
      },
    ],
  }

  const edit = {
    label: t('edit'),
    submenu: [
      {
        role: 'cut',
        label: t('cut'),
      },
      {
        role: 'copy',
        label: t('copy'),
      },
      {
        role: 'paste',
        label: t('paste'),
      },
      {
        role: 'delete',
        label: t('delete'),
      },
      {
        role: 'selectAll',
        label: t('selectAll'),
      },
    ],
  }

  const tools = {
    label: t('tools'),
    submenu: [
      {
        label: t('terminal'),
        click() {
          terminal.showWin()
        },
      },
    ],
  }

  const help: any = {
    role: 'help',
    label: t('help'),
    submenu: [
      {
        label: t('donate'),
        click() {
          shell.openExternal('http://surunzi.com/wechatpay.html')
        },
      },
      {
        label: t('reportIssue'),
        click() {
          shell.openExternal('https://github.com/liriliri/rin/issues')
        },
      },
      {
        type: 'separator',
      },
      {
        role: 'toggledevtools',
        label: t('toggleDevtools'),
      },
    ],
  }

  const template = [tools, help]
  if (isMac) {
    template.unshift(rin, edit)
  } else {
    template.unshift(rin)
  }

  return template
}

function updateMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(getTemplate()))

  if (isWindows) {
    window.sendTo('main', 'refreshMenu')
  }
}

export function init() {
  updateMenu()

  handleEvent('updateMenu', updateMenu)
}
