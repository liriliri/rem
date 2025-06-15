import isUndef from 'licia/isUndef'
import { makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'

class Store extends BaseStore {
  settingsLanguage = 'en-US'
  settingsTheme = 'light'
  constructor() {
    super()

    makeObservable(this, {
      settingsLanguage: observable,
      settingsTheme: observable,
    })

    this.init()
  }
  async init() {
    const names = ['language', 'theme']
    for (let i = 0, len = names.length; i < len; i++) {
      const name = names[i]
      const val = await main.getSettingsStore(name)
      if (!isUndef(val)) {
        runInAction(() => (this[this.getKey(name)] = val))
      }
    }
  }
  async set(name: string, val: any) {
    runInAction(() => {
      this[this.getKey(name)] = val
    })
    await main.setSettingsStore(name, val)
  }
  private getKey(name: string) {
    if (name === 'language') {
      return 'settingsLanguage'
    }
    if (name === 'theme') {
      return 'settingsTheme'
    }

    return name
  }
}

export default new Store()
