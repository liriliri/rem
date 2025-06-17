import { observer } from 'mobx-react-lite'
import LunaToolbar from 'luna-toolbar/react'
import Style from './Toolbar.module.scss'

export default observer(function Toolbar() {
  return <LunaToolbar className={Style.container}></LunaToolbar>
})
