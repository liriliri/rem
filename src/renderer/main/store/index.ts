import { action, makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import * as rclone from '../lib/rclone'
import map from 'licia/map'
import { t } from '../../../common/util'
import { IConfig } from './types'
import { Remote } from './remote'
import { setMainStore } from '../../lib/util'
import isUndef from 'licia/isUndef'
import some from 'licia/some'
import getUrlParam from 'licia/getUrlParam'
import find from 'licia/find'

class Store extends BaseStore {
  listView = false
  showConfig = true
  configs: IConfig[] = []
  selectedConfig = ''
  remote = new Remote(LOCAL_CONFIG)
  constructor() {
    super()

    makeObservable(this, {
      listView: observable,
      showConfig: observable,
      remote: observable,
      configs: observable,
      selectedConfig: observable,
      selectConfig: action,
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
      const name = getUrlParam('name')
      if (name) {
        const config = find(this.configs, (config) => config.name === name)
        if (config) {
          this.openRemote(config)
        } else {
          this.remote.go('')
        }
      } else {
        await this.remote.go('')
      }
    }
  }
  selectConfig(name: string) {
    this.selectedConfig = name
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
  async deleteConfig(name: string) {
    await rclone.deleteConfig(name)
    this.fetchConfigs()
  }
  async fetchConfigs() {
    const configDump = await rclone.getConfigDump()
    runInAction(() => {
      this.configs = map(configDump, (item, name) => {
        return {
          name,
          type: item.type,
          provider: item.provider,
          fs: `${name}:`,
        }
      })

      if (this.selectedConfig) {
        if (
          !some(this.configs, (config) => config.name === this.selectedConfig)
        ) {
          this.selectConfig('')
        }
      }

      this.configs.unshift(LOCAL_CONFIG)

      if (!some(this.configs, (config) => config.name === this.remote.name)) {
        this.remote = new Remote(LOCAL_CONFIG)
        this.remote.go('')
      }
    })
  }
}

const LOCAL_CONFIG = {
  name: t('localDisk'),
  type: 'local',
  fs: '/',
}

export default new Store()
