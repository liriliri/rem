import BaseStore from 'share/renderer/store/BaseStore'
import { Settings } from '../store/settings'
import { action, makeObservable, observable } from 'mobx'

class Store extends BaseStore {
  category = 'appearance'
  settings = new Settings()
  constructor() {
    super()

    makeObservable(this, {
      category: observable,
      selectCategory: action,
    })
  }
  selectCategory(category: string) {
    this.category = category
  }
}

export default new Store()
