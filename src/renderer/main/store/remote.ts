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
import isArr from 'licia/isArr'
import map from 'licia/map'
import contain from 'licia/contain'
import rtrim from 'licia/rtrim'

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
  async refresh(targets?: Target[] | Target) {
    if (targets) {
      if (!isArr(targets)) {
        targets = [targets]
      }
      for (let i = 0, len = targets.length; i < len; i++) {
        const { fs, remote } = targets[i]
        if (
          fs === this.fs &&
          rtrim(splitPath(remote).dir, '/') === this.remote
        ) {
          await this.fetchFileList(this.remote)
          break
        }
      }
      return
    }

    await this.fetchFileList(this.remote)
  }
  async newFolder(remote: string) {
    const target = {
      fs: this.fs,
      remote,
    }
    await rclone.mkdir(target)
    await this.refresh(target)
  }
  async deleteFile(remote: string) {
    const target = {
      fs: this.fs,
      remote,
    }
    await rclone.deleteFile(target)
    await this.refresh(target)
  }
  async deleteFolder(remote: string) {
    const target = {
      fs: this.fs,
      remote,
    }
    await rclone.purge(target)
    await this.refresh(target)
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

    for (let i = 0, len = files.length; i < len; i++) {
      jobs.push(await this.uploadFile(normalizePath(files[i])))
    }

    return jobs
  }
  async uploadFile(file: string) {
    const isDir = await node.isDirectory(file)
    return this.copyFrom(parseLocalPath(file), this.remote, isDir)
  }
  async downloadFiles(remotes: string[]) {
    const result = await main.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (result.canceled) {
      return []
    }
    const dir = normalizePath(result.filePaths[0])

    const jobs: Job[] = []

    for (let i = 0, len = remotes.length; i < len; i++) {
      jobs.push(await this.downloadFile(remotes[i], dir))
    }

    return jobs
  }
  async downloadFile(remote: string, dir: string) {
    const stat = await rclone.getFileStat({
      fs: this.fs,
      remote,
    })
    return this.copyTo(
      remote,
      parseLocalPath(dir + '/' + stat.Name),
      stat.IsDir
    )
  }
  async canPaste() {
    const clipboardData = await main.getMemStore('clipboard')

    return clipboardData && contain(['copy', 'cut'], clipboardData.type)
  }
  copyFiles(remotes: string[]) {
    this.setClipboardData('copy', remotes)
  }
  cutFiles(remotes: string[]) {
    this.setClipboardData('cut', remotes)
  }
  async pasteFiles(remote?: string) {
    const clipboardData = await main.getMemStore('clipboard')

    if (!clipboardData) {
      return []
    }

    const jobs: Job[] = []

    const targets = clipboardData.targets
    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i]
      const stat = await rclone.getFileStat(target)
      if (clipboardData.type === 'copy') {
        jobs.push(
          await this.copyFrom(target, remote || this.remote, stat.IsDir)
        )
      } else {
        jobs.push(
          await this.moveFrom(target, remote || this.remote, stat.IsDir)
        )
      }
    }

    await main.setMemStore('clipboard', null)

    return jobs
  }
  private async copyFrom(target: Target, remote: string, isDir: boolean) {
    const targetPair = genTargetPair(target, {
      fs: this.fs,
      remote,
    })

    const jobId = isDir
      ? await rclone.copyDir(targetPair)
      : await rclone.copyFile(targetPair)

    return new Job(jobId, JobType.Copy, targetPair)
  }
  private async moveFrom(target: Target, remote: string, isDir: boolean) {
    const targetPair = genTargetPair(target, {
      fs: this.fs,
      remote,
    })

    const jobId = isDir
      ? await rclone.moveDir(targetPair)
      : await rclone.moveFile(targetPair)

    const job = new Job(jobId, JobType.Move, targetPair)

    if (isDir) {
      job.on('success', () => rclone.purge(target))
    }

    return job
  }
  private async copyTo(remote: string, target: Target, isDir: boolean) {
    const targetPair = genTargetPair(
      {
        fs: this.fs,
        remote,
      },
      target,
      false
    )

    const jobId = isDir
      ? await rclone.copyDir(targetPair)
      : await rclone.copyFile(targetPair)

    return new Job(jobId, JobType.Copy, targetPair)
  }
  private async setClipboardData(type: string, remotes: string[]) {
    const clipboardData = {
      type,
      targets: map(remotes, (remote) => {
        return {
          fs: this.fs,
          remote: remote,
        }
      }),
    }
    await main.setMemStore('clipboard', clipboardData)
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
