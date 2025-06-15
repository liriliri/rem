import { observer } from 'mobx-react-lite'
import LunaSetting, {
  LunaSettingButton,
  LunaSettingSelect,
  LunaSettingTitle,
} from 'luna-setting/react'
import { t } from '../../common/util'
import store from './store'
import Style from './App.module.scss'
import contain from 'licia/contain'
import debounce from 'licia/debounce'
import { notify } from 'share/renderer/lib/util'

const notifyRequireReload = debounce(() => {
  notify(t('requireReload'), { icon: 'info' })
}, 1000)

export default observer(function App() {
  function onChange(key, val) {
    if (contain(['language'], key)) {
      notifyRequireReload()
    }
    store.set(key, val)
  }

  return (
    <LunaSetting className={Style.settings} onChange={onChange}>
      <LunaSettingTitle title={t('appearance')} />
      <LunaSettingSelect
        keyName="theme"
        value={store.settingsTheme}
        title={t('theme')}
        options={{
          [t('sysPreference')]: 'system',
          [t('light')]: 'light',
          [t('dark')]: 'dark',
        }}
      />
      <LunaSettingSelect
        keyName="language"
        value={store.settingsLanguage}
        title={t('language')}
        options={{
          [t('sysPreference')]: 'system',
          English: 'en-US',
          ['中文']: 'zh-CN',
        }}
      />
      <LunaSettingButton
        description={t('restartRin')}
        onClick={() => main.relaunch()}
      />
    </LunaSetting>
  )
})
