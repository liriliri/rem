import BaseStore from 'share/renderer/store/BaseStore'
import { Settings } from '../store/settings'

class Store extends BaseStore {
  settings = new Settings()
}

export default new Store()
