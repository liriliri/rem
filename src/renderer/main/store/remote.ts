import { IConfig } from './types'
import * as rclone from '../lib/rclone'
import { File, Target } from '../lib/rclone'
import { action, makeObservable, observable, runInAction } from 'mobx'
import splitPath from 'licia/splitPath'
import normalizePath from 'licia/normalizePath'
import trim from 'licia/trim'
import isEmpty from 'licia/isEmpty'
import { genTargetPair, parseLocalPath } from '../lib/util'
import { Job, JobType } from './job'

export class Remote {
  remote = ''
  name = ''
  customRemote = ''
  files: File[] = []
  history: string[] = []
  historyIdx = -1
  isLoading = false
  filter = ''
  fs: string
  constructor(config: IConfig) {
    const { name, fs } = config

    this.name = name
    this.fs = fs

    this.updateTitle()

    makeObservable(this, {
      remote: observable,
      customRemote: observable,
      history: observable,
      historyIdx: observable,
      files: observable,
      isLoading: observable,
      filter: observable,
      setCustomRemote: action,
      setFilter: action,
    })
  }
  setFilter(filter: string) {
    this.filter = filter
  }
  setCustomRemote(customRemote: string) {
    this.customRemote = customRemote
  }
  async back() {
    const { historyIdx } = this

    if (historyIdx <= 0) {
      return
    }

    await this.fetchFileList(this.history[historyIdx - 1])

    runInAction(() => {
      this.historyIdx -= 1
    })
  }
  async forward() {
    const { historyIdx, history } = this

    if (historyIdx >= history.length - 1) {
      return
    }

    await this.fetchFileList(history[historyIdx + 1])

    runInAction(() => {
      this.historyIdx += 1
    })
  }
  async up() {
    await this.go(this.remote.split('/').slice(0, -1).join('/'))
  }
  async go(remote: string) {
    await this.fetchFileList(remote)

    runInAction(() => {
      this.history = [...this.history.slice(0, this.historyIdx + 1), remote]
      this.historyIdx += 1
    })
  }
  async goCustomRemote() {
    const p = normalizePath(this.customRemote)

    this.go(trim(p, '/'))
  }
  async refresh() {
    await this.fetchFileList(this.remote)
  }
  async newFolder(remote: string) {
    await rclone.mkdir({
      fs: this.fs,
      remote,
    })
    await this.refresh()
  }
  async deleteFile(remote: string) {
    await rclone.deleteFile({
      fs: this.fs,
      remote,
    })
    await this.refresh()
  }
  async deleteFolder(remote: string) {
    await rclone.purge({
      fs: this.fs,
      remote,
    })
    await this.refresh()
  }
  async uploadFiles(files?: string[]) {
    if (!files) {
      const { filePaths } = await main.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
      })
      if (isEmpty(filePaths)) {
        return []
      }
      files = filePaths
    }

    const jobs: Job[] = []

    for (let i = 0, len = files!.length; i < len; i++) {
      jobs.push(await this.copyFrom(parseLocalPath(files![i])))
    }

    return jobs
  }
  private async copyFrom(target: Target) {
    const targetPair = genTargetPair(target, {
      fs: this.fs,
      remote: this.remote,
    })

    const jobId = await rclone.copyFile(targetPair)

    return new Job(jobId, JobType.Copy, targetPair)
  }
  private updateTitle() {
    let title = this.name

    if (this.remote) {
      title += ` - ${splitPath(this.remote).name}`
    }

    preload.setTitle(title)
  }
  private async fetchFileList(remote: string) {
    runInAction(() => {
      this.isLoading = true
    })

    try {
      const fileList = await rclone.getFileList({
        fs: this.fs,
        remote,
      })
      runInAction(() => {
        this.files = fileList
        this.remote = remote
        this.customRemote = this.remote
        this.setFilter('')
      })

      this.updateTitle()
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}
