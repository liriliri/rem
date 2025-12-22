import { t, i18n } from 'common/util'
import getUrlParam from 'licia/getUrlParam'
import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import log from 'share/common/log'
import LunaModal from 'luna-modal'
import * as rclone from 'common/rclone'
import 'share/renderer/main'
import 'luna-toolbar/css'
import 'luna-setting/css'
import 'luna-notification/css'
import 'luna-file-list/css'
import 'luna-icon-list/css'
import 'luna-data-grid/css'
import 'luna-modal/css'
import 'luna-split-pane/css'
import 'luna-image-viewer/css'
import 'luna-video-player/css'
import 'luna-music-player/css'
import 'luna-text-viewer/css'
import 'luna-carousel/css'
import 'luna-gallery/css'
import 'luna-path-bar/css'
import 'luna-music-visualizer/css'
import 'luna-tab/css'
import 'luna-performance-monitor/css'
import 'share/renderer/luna.scss'
import './luna.scss'
import 'share/renderer/main.scss'
import './icon.css'
import isWindows from 'licia/isWindows'
import contain from 'licia/contain'
import isMac from 'licia/isMac'
import { notify } from 'share/renderer/lib/util'
import pkg from '../../package.json'

const logger = log('renderer')
logger.info('start')

function renderApp() {
  logger.info('render app')

  const container: HTMLElement = document.getElementById('app') as HTMLElement

  let App = lazy(() => import('./main/App.js') as Promise<any>)
  let title = pkg.productName

  switch (getUrlParam('page')) {
    case 'terminal':
      App = lazy(() => import('share/renderer/terminal/App.js') as Promise<any>)
      title = t('terminal')
      break
    case 'process':
      App = lazy(() => import('share/renderer/process/App.js') as Promise<any>)
      title = t('processManager')
      break
    case 'settings':
      App = lazy(() => import('./settings/App.js') as Promise<any>)
      title = t('settings')
      break
    case 'about':
      App = lazy(() => import('share/renderer/about/App.js') as Promise<any>)
      title = t('aboutRem')
      break
    case 'mount':
      App = lazy(() => import('./mount/App.js') as Promise<any>)
      title = t('mountManager')
      break
    case 'job':
      App = lazy(() => import('./job/App.js') as Promise<any>)
      title = t('jobManager')
      break
    case 'video':
      App = lazy(() => import('share/renderer/video/App.js') as Promise<any>)
      break
    case 'password':
      App = lazy(() => import('./password/App.js') as Promise<any>)
      title = t('decryptConfig')
      break
  }

  preload.setTitle(title)

  createRoot(container).render(<App />)
}

;(async function () {
  const language = await main.getLanguage()
  i18n.locale(language)

  LunaModal.i18n.locale('en-US')
  LunaModal.i18n.set('en-US', {
    ok: t('ok'),
    cancel: t('cancel'),
  })

  if (getUrlParam('page') !== 'password') {
    const rclonePort = await main.getRclonePort()
    const rcloneAuth = await main.getRcloneAuth()
    const api = rclone.init(rclonePort, rcloneAuth)

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const url = error.config?.url || ''
        if (url === '/core/version') {
          return Promise.reject(error)
        }

        if (url === '/mount/mount') {
          const err = error.response.data.error
          if (isWindows && contain(err, 'cannot find winfsp')) {
            const result = await LunaModal.confirm(t('winfspNotFound'))
            if (result) {
              main.openExternal('https://winfsp.dev/')
            }
          } else if (isMac && contain(err, 'cannot find FUSE')) {
            const result = await LunaModal.confirm(t('macfuseNotFound'))
            if (result) {
              main.openExternal('https://macfuse.github.io/')
            }
          } else {
            const data = JSON.parse(error.config?.data || '{}')
            notify(t('mountErr', { mountPoint: data.mountPoint || '' }), {
              icon: 'error',
            })
          }
        } else {
          notify(t('reqErr'), { icon: 'error' })
        }

        return Promise.reject(error)
      }
    )
  }

  renderApp()
})()
