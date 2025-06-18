import { action, makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import * as rclone from '../lib/rclone'
import map from 'licia/map'
import { t } from '../../../common/util'
import { IConfig } from './types'
import { Remote } from './remote'
import { setMainStore } from '../../lib/util'
import isUndef from 'licia/isUndef'

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
    const listView = await main.getMainStore('listView')
    if (listView) {
      runInAction(() => (this.listView = true))
    }
    const showConfig = await main.getMainStore('showConfig')
    if (!isUndef(showConfig)) {
      runInAction(() => (this.showConfig = showConfig))
    }

    if (await rclone.wait()) {
      await this.fetchConfigs()
      await this.remote.go('')
    }
  }
  setViewMode(mode: 'list' | 'icon') {
    if (mode === 'list') {
      this.listView = true
    } else {
      this.listView = false
    }
    setMainStore('listView', this.listView)
  }
  toggleConfig() {
    this.showConfig = !this.showConfig
    setMainStore('showConfig', this.showConfig)
  }
  openRemote(config: IConfig) {
    this.remote = new Remote(config)
    this.remote.go('')
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
