import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import { observer } from 'mobx-react-lite'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from 'common/util'
import store from '../store'
import LunaModal from 'luna-modal'

export default observer(function Toolbar() {
  const { mount } = store

  return (
    <LunaToolbar>
      <ToolbarIcon
        icon="open-file"
        title={t('openDir')}
        disabled={!mount || !mount.mounted}
        onClick={() => main.openPath(store.mount!.mountPoint)}
      />
      <ToolbarIcon
        icon={mount && mount.mounted ? 'disconnect' : 'mount'}
        title={t(mount && mount.mounted ? 'unmount' : 'mount')}
        disabled={!mount}
        onClick={() => {
          if (mount!.mounted) {
            store.unmountSelected()
          } else {
            store.mountSelected()
          }
        }}
      />
      <ToolbarIcon
        icon="delete"
        title={t('delete')}
        disabled={!mount}
        onClick={() => store.deleteSelected()}
      />
      <LunaToolbarSpace />
      <ToolbarIcon
        icon="delete-all"
        title={t('deleteAllMounts')}
        onClick={async () => {
          const result = await LunaModal.confirm(t('deleteAllMountsConfirm'))
          if (result) {
            store.deleteAll()
          }
        }}
      />
      <LunaToolbarSeparator />
      <ToolbarIcon
        icon="refresh"
        title={t('refresh')}
        onClick={() => store.getMounts()}
      />
    </LunaToolbar>
  )
})
