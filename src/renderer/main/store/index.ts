import { action, makeObservable, observable } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'

class Store extends BaseStore {
  listView = false
  showConfig = true
  constructor() {
    super()

    makeObservable(this, {
      listView: observable,
      showConfig: observable,
      toggleConfig: action,
      setViewMode: action,
    })
  }
  setViewMode(mode: 'list' | 'icon') {
    if (mode === 'list') {
      this.listView = true
    } else {
      this.listView = false
    }
  }
  toggleConfig() {
    this.showConfig = !this.showConfig
  }
}

export default new Store()
