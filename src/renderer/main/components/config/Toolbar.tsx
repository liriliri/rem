import { observer } from 'mobx-react-lite'
import LunaToolbar, { LunaToolbarSpace } from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'
import ToolbarIcon from 'share/renderer/components/ToolbarIcon'
import { t } from '../../../../common/util'
import store from '../../store'

export default observer(function Toolbar() {
  return (
    <LunaToolbar className={Style.container}>
      <ToolbarIcon icon="editor" title={t('edit')} onClick={() => {}} />
      <LunaToolbarSpace />
      <ToolbarIcon
        icon="refresh"
        title={t('refresh')}
        onClick={() => store.fetchConfigs()}
      />
    </LunaToolbar>
  )
})
