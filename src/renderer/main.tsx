import { t, i18n } from '../common/util'
import getUrlParam from 'licia/getUrlParam'
import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import log from 'share/common/log'
import LunaModal from 'luna-modal'
import 'share/renderer/main'
import 'luna-toolbar/css'
import 'luna-setting/css'
import 'luna-notification/css'
import 'luna-file-list/css'
import 'luna-icon-list/css'
import 'luna-data-grid/css'
import 'luna-modal/css'
import 'luna-split-pane/css'
import 'share/renderer/luna.scss'
import './luna.scss'
import 'share/renderer/main.scss'
import './icon.css'

const logger = log('renderer')
logger.info('start')

function renderApp() {
  logger.info('render app')

  const container: HTMLElement = document.getElementById('app') as HTMLElement

  let App = lazy(() => import('./main/App.js') as Promise<any>)
  let title = 'REM'

  switch (getUrlParam('page')) {
    case 'terminal':
      App = lazy(() => import('share/renderer/terminal/App.js') as Promise<any>)
      title = t('terminal')
      break
    case 'settings':
      App = lazy(() => import('./settings/App.js') as Promise<any>)
      title = t('settings')
      break
    case 'about':
      App = lazy(() => import('./about/App.js') as Promise<any>)
      title = t('aboutRem')
      break
    case 'mount':
      App = lazy(() => import('./mount/App.js') as Promise<any>)
      title = t('mountManager')
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

  renderApp()
})()
