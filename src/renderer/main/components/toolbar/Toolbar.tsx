import { observer } from 'mobx-react-lite'
import LunaToolbar, {
  LunaToolbarHtml,
  LunaToolbarInput,
  LunaToolbarSeparator,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import Style from './Toolbar.module.scss'
import className from 'licia/className'
import store from '../../store'
import some from 'licia/some'
import { JobStatus } from '../../../store/job'

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
        <ToolbarIcon
          icon="bidirection"
          className={className({
            [Style.blink]: some(store.jobs, (job) => {
              return job.status === JobStatus.Running
            }),
          })}
          title={t('job')}
          state={store.showJob ? 'hover' : ''}
          onClick={() => {
            store.toggleJob()
          }}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="arrow-left"
          title={t('back')}
          onClick={() => remote.back()}
          disabled={remote.historyIdx <= 0 || remote.isLoading}
        />
        <ToolbarIcon
          icon="arrow-right"
          title={t('forward')}
          onClick={() => remote.forward()}
          disabled={
            remote.historyIdx >= remote.history.length - 1 || remote.isLoading
          }
        />
        <ToolbarIcon
          icon="arrow-up"
          title={t('up')}
          onClick={() => remote.up()}
          disabled={!remote.remote || remote.isLoading}
        />
        <ToolbarIcon
          icon="refresh"
          title={t('refresh')}
          onClick={() => remote.refresh()}
          disabled={remote.isLoading}
        />
        <LunaToolbarHtml
          className={className(Style.path, 'luna-toolbar-item-input')}
        >
          <input
            value={remote.customRemote}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              remote.setCustomRemote(e.target.value)
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                store.remote.goCustomRemote()
              }
            }}
          />
        </LunaToolbarHtml>
        <LunaToolbarInput
          keyName="filter"
          value={store.remote.filter}
          placeholder={t('filter')}
          onChange={(val) => store.remote.setFilter(val)}
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
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="eye"
          title={t('preview')}
          state={store.showPreview ? 'hover' : ''}
          onClick={() => store.togglePreview()}
        />
      </LunaToolbar>
    </>
  )
})
