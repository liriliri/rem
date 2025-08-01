import { getMainStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'
import { handleEvent } from 'share/main/lib/util'
import once from 'licia/once'
import uuid from 'licia/uuid'
import { IpcGetFileIcon, IpcGetWindowsDrives, IpcNewWindow } from 'common/types'
import childProcess from 'node:child_process'
import map from 'licia/map'
import trim from 'licia/trim'
import filter from 'licia/filter'
import endWith from 'licia/endWith'
import { app, BrowserWindow, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { t } from '../../common/util'
import types from 'licia/types'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import isMac from 'licia/isMac'
import * as mount from './mount'
import remove from 'licia/remove'
import isEmpty from 'licia/isEmpty'
import last from 'licia/last'

const logger = log('mainWin')

const store = getMainStore()

let focusedWin: BrowserWindow | null = null
const wins: BrowserWindow[] = []

export function showWin(name?: string) {
  logger.info('show')

  init()
  initIpc()

  const win = window.create({
    name: `main-${uuid()}`,
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
    menu: true,
  })
  wins.push(win)

  win.on('focus', () => (focusedWin = win))
  win.on('close', () => {
    remove(wins, (w) => w === win)
    win?.destroy()
    if (focusedWin === win) {
      focusedWin = null
    }
    if (!isEmpty(wins)) {
      focusedWin = last(wins)
    }
  })

  if (name) {
    window.loadPage(win, {
      name,
    })
  } else {
    window.loadPage(win)
  }
}

export function showFocusedWin() {
  if (focusedWin) {
    focusedWin.show()
    return true
  }

  return false
}

export const newWin: IpcNewWindow = function (name) {
  if (focusedWin) {
    const bounds = store.get('bounds')
    const winBounds = focusedWin.getBounds()
    bounds.x = winBounds.x + 50
    bounds.y = winBounds.y + 50
  }
  showWin(name)
}

const init = once(() => {
  autoUpdater.on('update-not-available', () => {
    alert('info', t('updateNotAvailable'))
  })
  autoUpdater.on('update-available', async () => {
    const result = await confirm(t('updateAvailable'))
    if (result) {
      shell.openExternal('https://rem.liriliri.io')
    }
  })
  autoUpdater.on('error', () => {
    alert('error', t('updateErr'))
  })
  function alert(type: 'info' | 'error', message: string) {
    if (focusedWin) {
      dialog.showMessageBox(focusedWin, {
        type,
        message,
        buttons: [t('ok')],
      })
    }
  }
  async function confirm(message: string) {
    if (focusedWin) {
      const res = await dialog.showMessageBox(focusedWin, {
        type: 'question',
        message,
        buttons: [t('ok'), t('cancel')],
      })
      return res.response === 0
    }
    return false
  }
})

const initIpc = once(() => {
  const getWindowsDrives: IpcGetWindowsDrives = function () {
    return new Promise((resolve, reject) => {
      childProcess.exec('wmic logicaldisk get caption', (err, stdout) => {
        if (err) {
          reject(err)
          return
        }

        const lines = map(stdout.split('\n'), (line) => trim(line))

        resolve(filter(lines, (line) => endWith(line, ':')))
      })
    })
  }

  const fileIcons: types.PlainObj<string> = {}
  const getFileIcon: IpcGetFileIcon = async (ext) => {
    if (fileIcons[ext]) {
      return fileIcons[ext]
    }

    let dataUrl =
      'data:image/svg+xml;base64,PHN2ZyB0PSIxNzM2NDI4Mzk1MTI4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIgogIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcC1pZD0iMTI4NiIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPgogIDxwYXRoCiAgICBkPSJNMTYwIDMyYy0xMiAwLTI0LjggNC44LTMzLjYgMTQuNFMxMTIgNjggMTEyIDgwdjg2NGMwIDEyIDQuOCAyNC44IDE0LjQgMzMuNiA5LjYgOS42IDIxLjYgMTQuNCAzMy42IDE0LjRoNzA0YzEyIDAgMjQuOC00LjggMzMuNi0xNC40IDkuNi05LjYgMTQuNC0yMS42IDE0LjQtMzMuNlYzMDRMNjQwIDMySDE2MHoiCiAgICBmaWxsPSIjRTVFNUU1IiBwLWlkPSIxMjg3Ij48L3BhdGg+CiAgPHBhdGggZD0iTTkxMiAzMDRINjg4Yy0xMiAwLTI0LjgtNC44LTMzLjYtMTQuNC05LjYtOC44LTE0LjQtMjEuNi0xNC40LTMzLjZWMzJsMjcyIDI3MnoiCiAgICBmaWxsPSIjQ0NDQ0NDIiBwLWlkPSIxMjg4Ij48L3BhdGg+Cjwvc3ZnPg=='

    if (!ext) {
      return dataUrl
    }

    const p = path.resolve(os.tmpdir(), `rem-file${ext}`)
    await fs.writeFile(p, '')
    try {
      const image = await app.getFileIcon(p, {
        size: isMac ? 'normal' : 'large',
      })
      dataUrl = image.toDataURL()
    } catch {
      // ignore
    }
    fileIcons[ext] = dataUrl
    return fileIcons[ext]
  }

  handleEvent('newWindow', newWin)
  handleEvent('getWindowsDrives', getWindowsDrives)
  handleEvent('getFileIcon', getFileIcon)
  handleEvent('showMount', () => mount.showWin())
})
