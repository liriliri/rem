import { observer } from 'mobx-react-lite'
import Style from './Statusbar.module.scss'
import className from 'licia/className'
import { t } from 'common/util'
import store from '../../store'

export default observer(function Statusbar() {
  return (
    <div className={Style.container}>
      <div
        className={className(Style.item, Style.button)}
        title={t('mountManager')}
        onClick={() => main.showMount()}
      >
        <span className="icon-mount"></span>
      </div>
      <div
        className={className(Style.item, Style.button)}
        title={t('rcloneCli')}
        onClick={() => main.openRcloneCli()}
      >
        <span className="icon-terminal"></span>
      </div>
      <div className={Style.space} />
      <div className={Style.item}>
        {t('totalItem', { total: store.remote.files.length })}
      </div>
    </div>
  )
})
