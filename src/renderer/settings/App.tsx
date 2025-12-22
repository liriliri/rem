import { observer } from 'mobx-react-lite'
import LunaSetting, {
  LunaSettingCheckbox,
  LunaSettingSelect,
} from 'luna-setting/react'
import { t } from 'common/util'
import store from './store'
import Style from './App.module.scss'
import contain from 'licia/contain'
import debounce from 'licia/debounce'
import { notify } from 'share/renderer/lib/util'
import SettingPath from 'share/renderer/components/SettingPath'
import toStr from 'licia/toStr'
import toNum from 'licia/toNum'
import LunaTab, { LunaTabItem } from 'luna-tab/react'
import className from 'licia/className'

const notifyRequireReload = debounce(() => {
  notify(t('requireReload'), { icon: 'info' })
}, 1000)

export default observer(function App() {
  function onChange(key, val) {
    if (contain(['language', 'useNativeTitlebar'], key)) {
      notifyRequireReload()
    }
    if (key === 'zoomFactor') {
      val = toNum(val)
    }
    store.settings.set(key, val)
  }

  return (
    <div className={Style.container}>
      <LunaTab onSelect={(category) => store.selectCategory(category)}>
        <LunaTabItem
          id="appearance"
          title={t('appearance')}
          selected={store.category === 'appearance'}
        />
        <LunaTabItem
          id="startup"
          title={t('startup')}
          selected={store.category === 'startup'}
        />
        <LunaTabItem
          id="rclone"
          title="Rclone"
          selected={store.category === 'rclone'}
        />
      </LunaTab>
      <div
        className={className(Style.settings, {
          hidden: store.category !== 'appearance',
        })}
      >
        <LunaSetting onChange={onChange}>
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
          <LunaSettingSelect
            keyName="zoomFactor"
            value={toStr(store.settings.zoomFactor)}
            title={t('zoomLevel')}
            options={{
              '100%': '1',
              '110%': '1.1',
              '120%': '1.2',
            }}
          />
          <LunaSettingCheckbox
            keyName="useNativeTitlebar"
            value={store.settings.useNativeTitlebar}
            description={t('useNativeTitlebar')}
          />
        </LunaSetting>
      </div>
      <div
        className={className(Style.settings, {
          hidden: store.category !== 'startup',
        })}
      >
        <LunaSetting onChange={onChange}>
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
          <LunaSettingCheckbox
            keyName="silentStart"
            value={store.settings.silentStart}
            description={t('silentStart')}
          />
        </LunaSetting>
      </div>
      <div
        className={className(Style.settings, {
          hidden: store.category !== 'rclone',
        })}
      >
        <LunaSetting onChange={onChange}>
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
        </LunaSetting>
      </div>
      <div className={Style.footer}>
        <button className="button primary" onClick={() => main.relaunch()}>
          {t('restartRem')}
        </button>
      </div>
    </div>
  )
})
