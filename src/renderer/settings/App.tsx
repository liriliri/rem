import { observer } from 'mobx-react-lite'
import LunaSetting, {
  LunaSettingButton,
  LunaSettingCheckbox,
  LunaSettingSelect,
  LunaSettingSeparator,
  LunaSettingTitle,
} from 'luna-setting/react'
import { t } from '../../common/util'
import store from './store'
import Style from './App.module.scss'
import contain from 'licia/contain'
import debounce from 'licia/debounce'
import { notify } from 'share/renderer/lib/util'
import SettingPath from 'share/renderer/components/SettingPath'

const notifyRequireReload = debounce(() => {
  notify(t('requireReload'), { icon: 'info' })
}, 1000)

export default observer(function App() {
  function onChange(key, val) {
    if (contain(['language'], key)) {
      notifyRequireReload()
    }
    store.settings.set(key, val)
  }

  return (
    <LunaSetting className={Style.settings} onChange={onChange}>
      <LunaSettingTitle title={t('appearance')} />
      <LunaSettingSelect
        keyName="theme"
        value={store.settings.theme}
        title={t('theme')}
        options={{
          [t('sysPreference')]: 'system',
          [t('light')]: 'light',
          [t('dark')]: 'dark',
        }}
      />
      <LunaSettingSelect
        keyName="language"
        value={store.settings.language}
        title={t('language')}
        options={{
          [t('sysPreference')]: 'system',
          English: 'en-US',
          ['中文']: 'zh-CN',
        }}
      />
      <LunaSettingSeparator />
      <LunaSettingTitle title="Rclone" />
      <SettingPath
        title={t('rclonePath')}
        value={store.settings.rclonePath}
        onChange={(val) => {
          notifyRequireReload()
          store.settings.set('rclonePath', val)
        }}
        options={{
          properties: ['openFile'],
        }}
      />
      <LunaSettingCheckbox
        keyName="autoMountWhenLaunch"
        value={store.settings.autoMountWhenLaunch}
        description={t('autoMountWhenLaunch')}
      />
      <LunaSettingButton
        description={t('restartRem')}
        onClick={() => main.relaunch()}
      />
    </LunaSetting>
  )
})
