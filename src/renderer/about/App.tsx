import Style from './App.module.scss'
import icon from '../assets/icon.png'
import { t } from '../../common/util'

export default function App() {
  return (
    <div className={Style.container}>
      <img src={icon} />
      <div>REM</div>
      <div>
        {t('version')} {REM_VERSION}
      </div>
    </div>
  )
}
