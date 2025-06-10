import hotKey from 'licia/hotKey'
import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import log from 'share/common/log'
import { isDev } from 'share/common/util'

const logger = log('renderer')
logger.info('start')

function renderApp() {
  logger.info('render app')

  const container: HTMLElement = document.getElementById('app') as HTMLElement

  const App = lazy(() => import('./main/App.js') as Promise<any>)
  const title = 'RIN'

  preload.setTitle(title)

  createRoot(container).render(<App />)
}

if (isDev()) {
  hotKey.on('f5', () => location.reload())
  hotKey.on('f12', () => main.toggleDevTools())
}

;(async function () {
  renderApp()
})()
