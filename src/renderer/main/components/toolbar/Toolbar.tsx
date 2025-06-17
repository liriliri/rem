import { observer } from 'mobx-react-lite'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import Style from './Toolbar.module.scss'
import className from 'licia/className'
import store from '../../store'

export default observer(function Toolbar() {
  const { remote } = store

  return (
    <>
      <LunaToolbar>
        <ToolbarIcon
          icon="remote-explorer"
          title={t('config')}
          state={store.showConfig ? 'hover' : ''}
          onClick={() => {
            store.toggleConfig()
          }}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="arrow-left"
          title={t('back')}
          onClick={() => remote.back()}
          disabled={remote.historyIdx <= 0}
        />
        <ToolbarIcon
          icon="arrow-right"
          title={t('forward')}
          onClick={() => remote.forward()}
          disabled={remote.historyIdx >= remote.history.length - 1}
        />
        <ToolbarIcon
          icon="arrow-up"
          title={t('up')}
          onClick={() => remote.up()}
          disabled={!remote.remote}
        />
        <LunaToolbarHtml
          className={className(Style.path, 'luna-toolbar-item-input')}
        >
          <input
            value={remote.customRemote}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              remote.setCustomRemote(e.target.value)
            }}
            onKeyDown={async () => {}}
          />
        </LunaToolbarHtml>
        <ToolbarIcon
          icon="refresh"
          title={t('refresh')}
          onClick={() => remote.refresh()}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="grid"
          title={t('iconView')}
          state={store.listView ? '' : 'hover'}
          onClick={() => {
            if (store.listView) {
              store.setViewMode('icon')
            }
          }}
        />
        <ToolbarIcon
          icon="list"
          title={t('listView')}
          state={store.listView ? 'hover' : ''}
          onClick={() => {
            if (!store.listView) {
              store.setViewMode('list')
            }
          }}
        />
      </LunaToolbar>
    </>
  )
})
