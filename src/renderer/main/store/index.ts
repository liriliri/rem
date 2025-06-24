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
import isWindows from 'licia/isWindows'
import isEmpty from 'licia/isEmpty'
import { Job, JobStatus, JobType } from './job'
import filter from 'licia/filter'
import each from 'licia/each'

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
      await this.fetchConfigs()
      const name = getUrlParam('name')
      if (name) {
        const config = find(this.configs, (config) => config.name === name)
        if (config) {
          this.openRemote(config)
          return
        }
      }

      this.openRemote(this.configs[0])
    }
  }
  addJob(job: Job) {
    job.on('success', () => {
      const { dstFs, dstRemote, srcFs, srcRemote } = job.pair

      if (job.type === JobType.Copy) {
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
}

let localConfigs: IConfig[] = []
async function getLocalConfigs(): Promise<IConfig[]> {
  if (isEmpty(localConfigs)) {
    if (isWindows) {
      const drives = await main.getWindowsDrives()
      return map(drives, (drive) => {
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
