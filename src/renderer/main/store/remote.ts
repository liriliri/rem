import * as rclone from '../../../common/rclone'
import {
  File,
  Target,
  TargetPair,
  About,
  Features,
} from '../../../common/rclone'
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
import toBool from 'licia/toBool'
import { addMount } from '../../lib/mount'
import { IConfig } from './'

export class Remote {
  remote = ''
  name = ''
  type = ''
  customRemote = ''
  files: File[] = []
  history: string[] = []
  historyIdx = -1
  isLoading = false
  filter = ''
  features: Features = {
    About: true,
    PublicLink: false,
    CanHaveEmptyDirectories: true,
  }
  about: About = {}
  fs: string
  constructor(config: IConfig) {
    const { name, fs } = config

    this.name = name
    this.fs = fs
    this.type = config.type

    this.updateTitle()

    makeObservable(this, {
      remote: observable,
      customRemote: observable,
      history: observable,
      historyIdx: observable,
      files: observable,
      isLoading: observable,
      filter: observable,
      about: observable,
      features: observable,
      setCustomRemote: action,
      setFilter: action,
    })

    this.init()
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

    await this.getFileList(this.history[historyIdx - 1])

    runInAction(() => {
      this.historyIdx -= 1
    })
  }
  async forward() {
    const { historyIdx, history } = this

    if (historyIdx >= history.length - 1) {
      return
    }

    await this.getFileList(history[historyIdx + 1])

    runInAction(() => {
      this.historyIdx += 1
    })
  }
  async up() {
    await this.go(this.remote.split('/').slice(0, -1).join('/'))
  }
  async go(remote: string) {
    await this.getFileList(remote)

    runInAction(() => {
      this.history = [...this.history.slice(0, this.historyIdx + 1), remote]
      this.historyIdx += 1
    })
  }
  async getPublicLink(remote: string) {
    return await rclone.createPublicLink({
      fs: this.fs,
      remote,
    })
  }
  getUrl(remote: string) {
    return `${rclone.getBaseURL()}/[${this.fs}]/${remote}`
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
        const parentDir = rtrim(splitPath(remote).dir, '/')
        if (
          fs === this.fs &&
          (parentDir === this.remote || remote === this.remote)
        ) {
          await this.getFileList(this.remote)
          break
        }
      }
      return
    }

    await this.getFileList(this.remote)
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
    return this.copyFrom(parseLocalPath(file), this.remote)
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
    return this.copyTo(
      remote,
      parseLocalPath(dir + '/' + splitPath(remote).name)
    )
  }
  async renameFile(remote: string, newName: string) {
    const target = {
      fs: this.fs,
      remote: splitPath(remote).dir + newName,
    }
    return await this.moveTo(remote, target)
  }
  async openFile(remote: string) {
    const tmpdir = node.tmpdir()
    const job = await this.downloadFile(remote, tmpdir)
    job.on('success', () => {
      main.openPath(tmpdir + '/' + splitPath(remote).name)
    })
    return job
  }
  async canPaste() {
    const clipboardData = await main.getMemStore('clipboard')

    return clipboardData && contain(['copy', 'cut'], clipboardData.type)
  }
  async canSync() {
    return toBool(await main.getMemStore('sync'))
  }
  copyFiles(remotes: string[]) {
    this.setClipboardData('copy', remotes)
  }
  cutFiles(remotes: string[]) {
    this.setClipboardData('cut', remotes)
  }
  async selectSyncFolder(remote: string) {
    const syncData = {
      target: {
        fs: this.fs,
        remote: remote,
      },
    }
    await main.setMemStore('sync', syncData)
  }
  async syncFolder(remote?: string) {
    const syncData = await main.getMemStore('sync')

    await main.setMemStore('sync', null)

    return this.syncFrom(syncData.target, remote || this.remote)
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
      if (clipboardData.type === 'copy') {
        jobs.push(await this.copyFrom(target, remote || this.remote))
      } else {
        jobs.push(await this.moveFrom(target, remote || this.remote))
      }
    }

    await main.setMemStore('clipboard', null)

    return jobs
  }
  async mount(mountPoint: string) {
    const fs = this.fs + this.remote
    mountPoint = normalizePath(mountPoint)
    await addMount(fs, mountPoint)
  }
  private async getAbout() {
    const about = await rclone.getAbout(this.fs)
    runInAction(() => {
      this.about = about
    })
  }
  private async getFsInfo() {
    const fsInfo = await rclone.getFsInfo(this.fs)
    runInAction(() => {
      this.features = fsInfo.Features
    })
  }
  private async init() {
    if (await rclone.wait()) {
      await this.getFsInfo()
      if (this.features.About) {
        await this.getAbout()
      }
    }
  }
  private async copyFrom(target: Target, remote: string) {
    return this.copy(
      genTargetPair(target, {
        fs: this.fs,
        remote,
      })
    )
  }
  private async copyTo(remote: string, target: Target) {
    return this.copy(
      genTargetPair(
        {
          fs: this.fs,
          remote,
        },
        target,
        false
      )
    )
  }
  private async copy(pair: TargetPair) {
    const stat = await rclone.getFileStat({
      fs: pair.srcFs,
      remote: pair.srcRemote,
    })
    const isDir = stat.IsDir

    const jobId = isDir
      ? await rclone.copyDir(pair)
      : await rclone.copyFile(pair)

    return new Job(jobId, JobType.Copy, pair)
  }
  private async moveFrom(target: Target, remote: string) {
    return this.move(
      genTargetPair(target, {
        fs: this.fs,
        remote,
      })
    )
  }
  private async moveTo(remote: string, target: Target) {
    return this.move(
      genTargetPair(
        {
          fs: this.fs,
          remote,
        },
        target,
        false
      )
    )
  }
  private async move(pair: TargetPair) {
    const stat = await rclone.getFileStat({
      fs: pair.srcFs,
      remote: pair.srcRemote,
    })
    const isDir = stat.IsDir

    const jobId = isDir
      ? await rclone.moveDir(pair)
      : await rclone.moveFile(pair)

    const job = new Job(jobId, JobType.Move, pair)

    if (isDir) {
      job.on('success', () =>
        rclone.purge({
          fs: pair.srcFs,
          remote: pair.srcRemote,
        })
      )
    }

    return job
  }
  private async syncFrom(target: Target, remote: string) {
    return this.sync(
      genTargetPair(
        target,
        {
          fs: this.fs,
          remote,
        },
        false
      )
    )
  }
  private async sync(pair: TargetPair) {
    const jobId = await rclone.syncDir(pair)

    return new Job(jobId, JobType.Sync, pair)
  }
  private async setClipboardData(type: string, remotes: string | string[]) {
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
  private async getFileList(remote: string) {
    runInAction(() => {
      this.isLoading = true
    })

    try {
      const fileList = await rclone.getFileList({
        fs: this.fs,
        remote,
      })
      for (let i = 0, len = fileList.length; i < len; i++) {
        const file = fileList[i]
        if (!file.IsDir) {
          file.Metadata = file.Metadata || {}
          file.Metadata.thumbnail = await main.getFileIcon(
            splitPath(file.Name).ext
          )
        }
      }
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
