import { observer } from 'mobx-react-lite'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import store from '../../store'
import LunaModal from 'luna-modal'
import AddConfigModal from './AddConfigModal'
import { useState } from 'react'

export default observer(function Toolbar() {
  const [addConfigModalVisible, setAddConfigModalVisible] = useState(false)

  const { selectedConfig } = store

  return (
    <>
      <LunaToolbar>
        <ToolbarIcon
          icon="add"
          title={t('delete')}
          onClick={async () => setAddConfigModalVisible(true)}
        />
        <LunaToolbarSeparator />
        <ToolbarIcon
          icon="copy"
          title={t('duplicate')}
          onClick={async () => {
            store.duplicateConfig(selectedConfig!, `${selectedConfig!}_copy`)
          }}
          disabled={!selectedConfig}
        />
        <ToolbarIcon
          icon="rename"
          title={t('rename')}
          onClick={async () => {
            const name = await LunaModal.prompt(
              t('newConfigName'),
              selectedConfig!
            )
            if (name) {
              store.renameConfig(selectedConfig!, name)
            }
          }}
          disabled={!selectedConfig}
        />
        <ToolbarIcon
          icon="delete"
          title={t('delete')}
          onClick={async () => {
            const result = await LunaModal.confirm(
              t('deleteConfigConfirm', { name: selectedConfig! })
            )
            if (result) {
              store.deleteConfig(selectedConfig!)
            }
          }}
          disabled={!selectedConfig}
        />
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="refresh"
          title={t('refresh')}
          onClick={() => store.getConfigs()}
        />
      </LunaToolbar>
      <AddConfigModal
        visible={addConfigModalVisible}
        onClose={() => setAddConfigModalVisible(false)}
      />
    </>
  )
})
