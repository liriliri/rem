import { observer } from 'mobx-react-lite'
import Style from './Config.module.scss'
import Toolbar from './Toolbar'
import store from '../../store'
import map from 'licia/map'
import DefaultIcon from '../../../assets/config-icon/default.svg'
import DriveIcon from '../../../assets/config-icon/drive.svg'

export default observer(function Config() {
  const configs = map(store.configs, (config) => {
    return (
      <div key={config.name} className={Style.config}>
        <div className={Style.configIcon}>
          <img src={getConfigIcon(config.type)} />
        </div>
        {config.name}
      </div>
    )
  })

  return (
    <div
      className={Style.container}
      style={{
        display: store.showConfig ? 'block' : 'none',
      }}
    >
      <Toolbar />
      <div className={Style.configList}>{configs}</div>
    </div>
  )
})

function getConfigIcon(type: string) {
  switch (type) {
    case 'drive':
      return DriveIcon
    default:
      return DefaultIcon
  }
}
