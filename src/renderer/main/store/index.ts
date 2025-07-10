import { action, makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import * as rclone from '../../lib/rclone'
import { Provider } from '../../lib/rclone'
import map from 'licia/map'
import { t } from '../../../common/util'
import { IConfig } from './types'
import { Remote } from './remote'
import { setMainStore } from '../../lib/util'
import isUndef from 'licia/isUndef'
import some from 'licia/some'
import getUrlParam from 'licia/getUrlParam'
import find from 'licia/find'
import isWindows from 'licia/isWindows'
import isEmpty from 'licia/isEmpty'
import { Job, JobStatus, JobType } from './job'
import filter from 'licia/filter'
import each from 'licia/each'
import { notify, setMemStore } from 'share/renderer/lib/util'
import { Settings } from '../../store/settings'
import types from 'licia/types'
import isStr from 'licia/isStr'

class Store extends BaseStore {
  listView = false
  showConfig = true
  configWeight = 25
  showJob = true
  jobWeight = 30
  configs: IConfig[] = []
  selectedConfig = ''
  remote = new Remote({
    name: 'REM',
    type: 'local',
    fs: '/',
  })
  jobs: Job[] = []
  settings = new Settings()
  providers: Provider[] = []
  constructor() {
    super()

    makeObservable(this, {
      listView: observable,
      showConfig: observable,
      configWeight: observable,
      showJob: observable,
      jobWeight: observable,
      remote: observable,
      configs: observable,
      selectedConfig: observable,
      jobs: observable,
      providers: observable,
      selectConfig: action,
      toggleConfig: action,
      setConfigWeight: action,
      setViewMode: action,
      openRemote: action,
      toggleJob: action,
      setJobWeight: action,
      addJob: action,
      deleteJob: action,
      clearFinishedJobs: action,
    })

    this.init()
  }
  async init() {
    const listView = await main.getMainStore('listView')
    const configWeight: number = await main.getMainStore('configWeight')
    const showConfig = await main.getMainStore('showConfig')
    const showJob = await main.getMainStore('showJob')
    const jobWeight = await main.getMainStore('jobWeight')
    runInAction(() => {
      if (listView) {
        this.listView = true
      }
      if (configWeight) {
        this.configWeight = configWeight
      }
      if (!isUndef(showConfig)) {
        this.showConfig = showConfig
      }
      if (jobWeight) {
        this.jobWeight = jobWeight
      }
      if (!isUndef(showJob)) {
        this.showJob = showJob
      }
    })

    if (await rclone.wait()) {
      await this.getConfigs()
      await this.getProviders()
      const name = getUrlParam('name')
      if (name) {
        const config = find(this.configs, (config) => config.name === name)
        if (config) {
          this.openRemote(config)
          return
        }
      }

      this.openRemote(this.configs[0])

      if (this.settings.autoMount) {
        this.autoMount()
      }
    }
  }
  addJob(job: Job) {
    job.on('success', () => {
      const { dstFs, dstRemote, srcFs, srcRemote } = job.pair

      if (job.type === JobType.Copy || job.type === JobType.Sync) {
        this.remote.refresh({
          fs: dstFs,
          remote: dstRemote,
        })
      } else if (job.type === JobType.Move) {
        this.remote.refresh([
          {
            fs: srcFs,
            remote: srcRemote,
          },
          {
            fs: dstFs,
            remote: dstRemote,
          },
        ])
      }
    })
    this.jobs.push(job)
  }
  deleteJob(id: number) {
    const job = this.getJob(id)
    if (job) {
      job.stop()
      this.jobs = filter(this.jobs, (job) => job.id !== id)
    }
  }
  getJob(id: number): Job | void {
    return find(this.jobs, (job) => job.id === id)
  }
  stopAllJobs() {
    each(this.jobs, (job) => job.stop())
  }
  clearFinishedJobs() {
    this.jobs = filter(this.jobs, (job) => {
      return job.status === JobStatus.Running
    })
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
  setConfigWeight(weight: number) {
    this.configWeight = weight
    setMainStore('configWeight', this.configWeight)
  }
  toggleConfig() {
    this.showConfig = !this.showConfig
    setMainStore('showConfig', this.showConfig)
  }
  toggleJob() {
    this.showJob = !this.showJob
    setMainStore('showJob', this.showJob)
  }
  setJobWeight(weight: number) {
    this.jobWeight = weight
    setMainStore('jobWeight', this.jobWeight)
  }
  openRemote(config: IConfig | string) {
    if (isStr(config)) {
      const c = find(this.configs, (c) => c.name === config)
      if (c) {
        config = c
      }
    }

    if (!isStr(config)) {
      this.remote = new Remote(config)
      this.remote.go('')
    }
  }
  async duplicateConfig(name: string, newName: string) {
    await this._duplicateConfig(name, newName)
    await this.getConfigs()
    this.selectConfig(newName)
  }
  async renameConfig(name: string, newName: string) {
    await this._duplicateConfig(name, newName)
    await rclone.deleteConfig(name)
    if (this.remote.name === name) {
      this.remote.name = newName
    }
    await this.getConfigs()
    this.selectConfig(newName)
  }
  async deleteConfig(name: string) {
    await rclone.deleteConfig(name)
    this.getConfigs()
  }
  async getConfigs() {
    const configDump = await rclone.getConfigDump()
    runInAction(() => {
      this.configs = map(configDump, (item, name) => {
        return {
          name,
          type: item.type,
          provider: item.provider,
          url: item.url,
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
    })

    const localConfigs = await getLocalConfigs()
    runInAction(() => {
      this.configs.unshift(...localConfigs)
    })

    if (
      !some(this.configs, (config) => config.name === this.remote.name) &&
      this.remote.name !== 'REM'
    ) {
      this.openRemote(localConfigs[0])
    }
  }
  async createConfig(
    name: string,
    type: string,
    parameters: types.PlainObj<any>,
    opt: rclone.ICreateConfigOptions = {}
  ) {
    await this._createConfig(name, type, parameters, opt)
    await this.getConfigs()
    this.selectConfig(name)
    await this.openRemote(name)
  }
  private async _duplicateConfig(name: string, newName: string) {
    const config = await rclone.getConfig(name)

    await this._createConfig(newName, config.type, config, {
      NonInteractive: true,
    })
  }
  private async _createConfig(
    name: string,
    type: string,
    parameters: types.PlainObj<any>,
    opt: rclone.ICreateConfigOptions = {}
  ) {
    if (find(this.configs, (config) => config.name === name)) {
      const msg = t('configExist', { name })
      notify(msg, { icon: 'error' })
      throw new Error(msg)
    }
    await rclone.createConfig(name, type, parameters, opt)
  }
  private async getProviders() {
    const providers = await rclone.getProviders()
    runInAction(() => {
      this.providers = providers
    })
  }
  private async autoMount() {
    const autoMounted = await main.getMemStore('autoMounted')
    if (autoMounted) {
      return
    }

    const mounts = (await main.getMainStore('mounts')) || []
    const mountedMounts = await rclone.listMounts()
    for (let i = 0, len = mounts.length; i < len; i++) {
      const mount = mounts[i]
      if (
        some(
          mountedMounts,
          (m) => m.Fs === mount.fs && m.MountPoint === mount.mountPoint
        )
      ) {
        continue
      }

      try {
        await rclone.createMount(mount.fs, mount.mountPoint)
      } catch {
        // ignore
      }
    }

    setMemStore('autoMounted', true)
  }
}

let localConfigs: IConfig[] = []
async function getLocalConfigs(): Promise<IConfig[]> {
  if (isEmpty(localConfigs)) {
    if (isWindows) {
      const drives = await main.getWindowsDrives()
      localConfigs = map(drives, (drive) => {
        return {
          name: `${t('localDisk')} (${drive})`,
          type: 'remdisk',
          fs: drive + '/',
        }
      })
    } else {
      localConfigs = [
        {
          name: t('localDisk'),
          type: 'remdisk',
          fs: '/',
        },
      ]
    }
  }

  return localConfigs
}

export default new Store()
