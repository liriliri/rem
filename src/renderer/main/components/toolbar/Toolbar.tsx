import { observer } from 'mobx-react-lite'
import LunaToolbar, {
  LunaToolbarSeparator,
  LunaToolbarSpace,
} from 'luna-toolbar/react'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'

export default observer(function Toolbar() {
  return (
    <>
      <LunaToolbar>
        <ToolbarIcon icon="remote-explorer" title={t('')} onClick={() => {}} />
        <LunaToolbarSeparator />
        <ToolbarIcon icon="arrow-left" title={t('')} onClick={() => {}} />
        <ToolbarIcon icon="arrow-right" title={t('')} onClick={() => {}} />
        <ToolbarIcon icon="arrow-up" title={t('')} onClick={() => {}} />
        <LunaToolbarSpace />
        <ToolbarIcon icon="list" title={t('')} onClick={() => {}} />
      </LunaToolbar>
    </>
  )
})
