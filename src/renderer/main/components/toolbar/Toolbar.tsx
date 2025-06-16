import { observer } from 'mobx-react-lite'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarSeparator,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import Style from './Toolbar.module.scss'
import className from 'licia/className'
import { useState } from 'react'
import store from '../../store'

export default observer(function Toolbar() {
  const [customPath, setCustomPath] = useState('')

  return (
    <>
      <LunaToolbar>
        <ToolbarIcon
          icon="remote-explorer"
          title={t('config')}
          onClick={() => {}}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon icon="arrow-left" title={t('back')} onClick={() => {}} />
        <ToolbarIcon
          icon="arrow-right"
          title={t('forward')}
          onClick={() => {}}
        />
        <ToolbarIcon icon="arrow-up" title={t('up')} onClick={() => {}} />
        <LunaToolbarHtml
          className={className(Style.path, 'luna-toolbar-item-input')}
        >
          <input
            value={customPath}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCustomPath(e.target.value)
            }}
            onKeyDown={async () => {}}
          />
        </LunaToolbarHtml>
        <ToolbarIcon icon="refresh" title={t('refresh')} onClick={() => {}} />
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
