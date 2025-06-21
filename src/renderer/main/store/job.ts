import * as rclone from '../lib/rclone'
import { TargetPair } from '../lib/rclone'

export enum JobType {
  Copy,
}

export class Job {
  id: number
  type: JobType
  source: string
  destination: string
  private getStatusTimer?: NodeJS.Timeout
  constructor(id: number, type: JobType, pair: TargetPair) {
    this.id = id
    this.type = type
    this.source = `${pair.srcFs}${pair.srcRemote}`
    this.destination = `${pair.dstFs}${pair.dstRemote}`

    this.getStatus()
  }
  private async getStatus() {
    const status = await rclone.getStatusForJob(this.id)
    console.log(status)
  }
}
