import { action, makeObservable, observable, runInAction } from 'mobx'
import isUndef from 'licia/isUndef'

export class Settings {
  language = 'en-US'
  theme = 'light'
  rclonePath = ''
  configPath = ''
  autoMount = false
  openAtLogin = false
  constructor() {
    makeObservable(this, {
      language: observable,
      theme: observable,
      rclonePath: observable,
      configPath: observable,
      autoMount: observable,
      openAtLogin: observable,
      set: action,
    })

    this.init()
  }
  async init() {
    const names = [
      'language',
      'theme',
      'rclonePath',
      'configPath',
      'autoMount',
      'openAtLogin',
    ]
    for (let i = 0, len = names.length; i < len; i++) {
      const name = names[i]
      const val = await main.getSettingsStore(name)
      if (!isUndef(val)) {
        runInAction(() => (this[name] = val))
      }
    }
  }
  async set(name: string, val: any) {
    runInAction(() => {
      this[name] = val
    })
    await main.setSettingsStore(name, val)
  }
}
