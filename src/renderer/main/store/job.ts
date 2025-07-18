import { makeObservable, observable, runInAction } from 'mobx'
import * as rclone from '../../../common/rclone'
import { TargetPair } from '../../../common/rclone'
import now from 'licia/now'
import Emitter from 'licia/Emitter'

export enum JobType {
  Copy,
  Move,
  Sync,
}

export enum JobStatus {
  Running,
  Cancel,
  Success,
  Fail,
}

export class Job extends Emitter {
  id: number
  type: JobType
  duration = 0
  startTime = new Date()
  status = JobStatus.Running
  pair: TargetPair
  totalBytes = 0
  transferredBytes = 0
  totalFiles = 0
  transferredFiles = 0
  speed = 0
  constructor(id: number, type: JobType, pair: TargetPair) {
    super()

    this.id = id
    this.type = type
    this.pair = pair

    makeObservable(this, {
      duration: observable,
      status: observable,
      totalBytes: observable,
      transferredBytes: observable,
      totalFiles: observable,
      transferredFiles: observable,
    })

    this.getStatus()
  }
  async stop() {
    if (this.status !== JobStatus.Running) {
      return
    }
    await rclone.stopJob(this.id)
    this.status = JobStatus.Cancel
  }
  private async getStatus() {
    const status = await rclone.getStatusForJob(this.id)
    const stats = await rclone.stats(this.id)
    runInAction(() => {
      if (status.finished) {
        if (this.status !== JobStatus.Cancel) {
          if (status.success) {
            this.status = JobStatus.Success
            this.emit('success', this)
          } else {
            this.status = JobStatus.Fail
            this.emit('fail', this)
          }
        }
        this.emit('finish', this)
      }
      this.startTime = new Date(status.startTime)
      if (!status.duration) {
        this.duration = (now() - this.startTime.getTime()) / 1000
      } else {
        this.duration = status.duration
      }

      this.totalBytes = stats.totalBytes
      this.transferredBytes = stats.bytes
      this.totalFiles = stats.totalTransfers
      this.transferredFiles = stats.transfers
      this.speed = Math.round(stats.bytes / this.duration)
    })
    if (!status.finished) {
      setTimeout(() => {
        this.getStatus()
      }, 1000)
    }
  }
}
