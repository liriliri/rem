import { observer } from 'mobx-react-lite'
import Style from './About.module.scss'
import { t } from '../../../../common/util'
import store from '../../store'
import fileSize from 'licia/fileSize'

export default observer(function About() {
  const { about } = store.remote
  const total = about.total || 0
  const free = about.free || 0

  const used = total - free

  return (
    <div className={Style.container}>
      <div className={Style.storage}>
        <div className={Style.used}>
          {t('usedStorage', {
            storage: fileSize(used) + 'B',
          })}
        </div>
        <div className={Style.total}>
          {t('totalStorage', { storage: fileSize(total) + 'B' })}
        </div>
      </div>
      <div className={Style.bar}>
        <div
          className={Style.barUsed}
          style={{
            width: about.total ? `${(used / about.total) * 100}%` : '0',
          }}
        ></div>
      </div>
    </div>
  )
})
