import { observer } from 'mobx-react-lite'
import Style from './Config.module.scss'
import Toolbar from './Toolbar'
import store from '../../store'

export default observer(function Config() {
  return (
    <div
      className={Style.container}
      style={{
        display: store.showConfig ? 'block' : 'none',
      }}
    >
      <Toolbar />
    </div>
  )
})
