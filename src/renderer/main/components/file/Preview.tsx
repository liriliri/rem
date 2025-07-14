import { observer } from 'mobx-react-lite'
import Style from './Preview.module.scss'

export default observer(function Preview() {
  return <div className={Style.container}></div>
})
