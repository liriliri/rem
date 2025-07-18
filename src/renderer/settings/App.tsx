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
      <LunaSettingTitle title={t('startup')} />
      <LunaSettingCheckbox
        keyName="openAtLogin"
        value={store.settings.openAtLogin}
        description={t('openAtLogin')}
      />
      <LunaSettingCheckbox
        keyName="autoMount"
        value={store.settings.autoMount}
        description={t('autoMount')}
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
      <SettingPath
        title={t('configPath')}
        value={store.settings.configPath}
        onChange={(val) => {
          notifyRequireReload()
          store.settings.set('configPath', val)
        }}
        options={{
          properties: ['openFile'],
        }}
      />
      <LunaSettingButton
        description={t('restartRem')}
        onClick={() => main.relaunch()}
      />
    </LunaSetting>
  )
})
