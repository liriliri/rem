import { IConfig } from './types'
import * as rclone from '../lib/rclone'
import { File } from '../lib/rclone'
import { action, makeObservable, observable, runInAction } from 'mobx'
import { t } from '../../../common/util'

export class Remote {
  remote = ''
  customRemote = ''
  files: File[] = []
  history: string[] = []
  historyIdx = -1
  isLoading = false
  private fs: string
  constructor(config: IConfig) {
    const { name, fs } = config
    if (fs === '/') {
      preload.setTitle(t('localDisk'))
    } else {
      preload.setTitle(name)
    }

    this.fs = fs

    makeObservable(this, {
      remote: observable,
      customRemote: observable,
      history: observable,
      historyIdx: observable,
      files: observable,
      isLoading: observable,
      setCustomRemote: action,
    })
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
  async refresh() {
    await this.fetchFileList(this.remote)
  }
  private async fetchFileList(remote: string) {
    runInAction(() => {
      this.isLoading = true
    })

    const fileList = await rclone.getFileList({
      fs: this.fs,
      remote,
    })

    runInAction(() => {
      this.files = fileList
      this.remote = remote
      this.customRemote = this.remote
      this.isLoading = false
    })
  }
}
