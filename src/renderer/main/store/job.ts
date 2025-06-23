import { makeObservable, observable, runInAction } from 'mobx'
import * as rclone from '../lib/rclone'
import { TargetPair } from '../lib/rclone'
import now from 'licia/now'
import Emitter from 'licia/Emitter'

export enum JobType {
  Copy,
  Move,
}

export enum JobStatus {
  Running,
  Stop,
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
  constructor(id: number, type: JobType, pair: TargetPair) {
    super()

    this.id = id
    this.type = type
    this.pair = pair

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
        if (status.success) {
          this.status = JobStatus.Success
          this.emit('success', this)
        } else {
          this.status = JobStatus.Fail
          this.emit('fail', this)
        }
        this.emit('finish', this)
      }
      this.startTime = new Date(status.startTime)
      if (!status.duration) {
        this.duration = (now() - this.startTime.getTime()) / 1000
      } else {
        this.duration = status.duration
      }
    })
    if (!status.finished) {
      setTimeout(() => {
        this.getStatus()
      }, 1000)
    }
  }
}
