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
