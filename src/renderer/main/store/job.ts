import { makeObservable, observable, runInAction } from 'mobx'
import * as rclone from '../lib/rclone'
import { TargetPair } from '../lib/rclone'

export enum JobType {
  Copy,
}

export enum JobStatus {
  Running,
  Stop,
  Success,
  Fail,
}

export class Job {
  id: number
  type: JobType
  source: string
  destination: string
  duration = 0
  status = JobStatus.Running
  constructor(id: number, type: JobType, pair: TargetPair) {
    this.id = id
    this.type = type
    this.source = `${pair.srcFs}${pair.srcRemote}`
    this.destination = `${pair.dstFs}${pair.dstRemote}`

    makeObservable(this, {
      duration: observable,
      status: observable,
    })

    this.getStatus()
  }
  private async getStatus() {
    const status = await rclone.getStatusForJob(this.id)
    runInAction(() => {
      if (status.finished) {
        this.status = status.success ? JobStatus.Success : JobStatus.Fail
      }
      this.duration = status.duration
    })
    if (!status.finished) {
      setTimeout(() => {
        this.getStatus()
      }, 1000)
    }
  }
}
