import { observer } from 'mobx-react-lite'
import LunaToolbar, { LunaToolbarSpace } from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import { useState } from 'react'

export default observer(function Toolbar() {
  const [settingsVisible, setSettingsVisible] = useState(false)

  return (
    <>
      <LunaToolbar>
        <LunaToolbarSpace />
        <ToolbarIcon
          icon="setting"
          title={t('settings')}
          onClick={() => setSettingsVisible(true)}
        />
      </LunaToolbar>
    </>
  )
})
