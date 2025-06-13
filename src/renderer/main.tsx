import { t } from '../common/util'
import getUrlParam from 'licia/getUrlParam'
import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import log from 'share/common/log'
import 'share/renderer/main'
import 'luna-toolbar/css'
import 'share/renderer/luna.scss'
import 'share/renderer/main.scss'
import './main.scss'
import './icon.css'

const logger = log('renderer')
logger.info('start')

function renderApp() {
  logger.info('render app')

  const container: HTMLElement = document.getElementById('app') as HTMLElement

  let App = lazy(() => import('./main/App.js') as Promise<any>)
  let title = 'RIN'

  switch (getUrlParam('page')) {
    case 'terminal':
      App = lazy(() => import('share/renderer/terminal/App.js') as Promise<any>)
      title = t('terminal')
      break
  }

  preload.setTitle(title)

  createRoot(container).render(<App />)
}

;(async function () {
  renderApp()
})()
