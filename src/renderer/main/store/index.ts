import { action, makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import * as rclone from '../lib/rclone'
import map from 'licia/map'
import { t } from '../../../common/util'
import { IConfig } from './types'
import { Remote } from './remote'

class Store extends BaseStore {
  listView = false
  showConfig = true
  configs: IConfig[] = []
  remote = new Remote(LOCAL_CONFIG)
  constructor() {
    super()

    makeObservable(this, {
      listView: observable,
      showConfig: observable,
      remote: observable,
      configs: observable,
      toggleConfig: action,
      setViewMode: action,
      openRemote: action,
    })

    this.init()
  }
  async init() {
    await this.fetchConfigs()
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
  openRemote(config: IConfig) {
    this.remote = new Remote(config)
  }
  async fetchConfigs() {
    const configDump = await rclone.getConfigDump()
    runInAction(() => {
      this.configs = map(configDump, (item, name) => {
        return {
          name,
          type: item.type,
          fs: `${name}:`,
        }
      })
      this.configs.unshift(LOCAL_CONFIG)
    })
  }
}

const LOCAL_CONFIG = {
  name: t('localDisk'),
  type: 'local',
  fs: '/',
}

export default new Store()
