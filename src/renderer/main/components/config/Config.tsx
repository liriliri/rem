import { observer } from 'mobx-react-lite'
import Style from './Config.module.scss'
import Toolbar from './Toolbar'
import store from '../../store'
import map from 'licia/map'
import DefaultIcon from '../../../assets/config-icon/default.svg'
import DriveIcon from '../../../assets/config-icon/drive.svg'
import DropboxIcon from '../../../assets/config-icon/dropbox.svg'
import CloudflareIcon from '../../../assets/config-icon/cloudflare.svg'
import OneDriveIcon from '../../../assets/config-icon/onedrive.svg'
import className from 'licia/className'
import { t } from '../../../../common/util'

export default observer(function Config() {
  const configs = map(store.configs, (config) => {
    return (
      <div
        key={config.name}
        className={className(Style.config, {
          [Style.selected]: store.selectedConfig === config.name,
          [Style.connected]: store.remote.name === config.name,
        })}
        onClick={() => {
          if (config.name === t('localDisk')) {
            return
          }
          store.selectConfig(config.name)
        }}
      >
        <div className={Style.configIcon}>
          <img src={getConfigIcon(config.type, config.provider)} />
        </div>
        <div className={Style.configName}>{config.name}</div>
        <div
          className={Style.configButton}
          title={t('openInCurWin')}
          onClick={(e) => {
            e.stopPropagation()
            store.openRemote(config)
          }}
        >
          <span className="icon-arrow-right"></span>
        </div>
        <div
          className={Style.configButton}
          title={t('openInNewWin')}
          onClick={(e) => {
            e.stopPropagation()
            main.newWindow(config.name)
          }}
        >
          <span className="icon-empty-window"></span>
        </div>
      </div>
    )
  })

  return (
    <div className={Style.container}>
      <Toolbar />
      <div className={Style.configList}>{configs}</div>
    </div>
  )
})

function getConfigIcon(type: string, provider?: string) {
  if (type === 's3') {
    switch (provider) {
      case 'Cloudflare':
        return CloudflareIcon
    }
  }

  switch (type) {
    case 'drive':
      return DriveIcon
    case 'dropbox':
      return DropboxIcon
    case 'onedrive':
      return OneDriveIcon
    default:
      return DefaultIcon
  }
}
