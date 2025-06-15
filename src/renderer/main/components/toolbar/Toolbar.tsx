import { observer } from 'mobx-react-lite'
import LunaToolbar, { LunaToolbarSpace } from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'

export default observer(function Toolbar() {
  return (
    <>
      <LunaToolbar>
        <LunaToolbarSpace />
        <ToolbarIcon icon="list" title={t('')} onClick={() => {}} />
      </LunaToolbar>
    </>
  )
})
