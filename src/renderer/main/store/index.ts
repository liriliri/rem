import { action, makeObservable, observable } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'

class Store extends BaseStore {
  listView = false
  constructor() {
    super()

    makeObservable(this, {
      listView: observable,
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
}

export default new Store()
