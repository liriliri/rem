import { observer } from 'mobx-react-lite'
import Style from './Config.module.scss'

export default observer(function Config() {
  return <div className={Style.container}></div>
})
