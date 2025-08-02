import { makeObservable, observable, runInAction } from 'mobx'
import * as rclone from '../../common/rclone'
import { TargetPair } from '../../common/rclone'
import now from 'licia/now'
import Emitter from 'licia/Emitter'
import { t } from '../../common/util'
import remove from 'licia/remove'
import { setMemStore } from 'share/renderer/lib/util'

export enum JobType {
  Copy,
  Move,
  Sync,
}

export interface IJobOptions {
  id: number
  type: JobType
  pair: TargetPair
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
  error = ''
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
            this.emit('success')
          } else {
            this.status = JobStatus.Fail
            this.error = status.error
            this.emit('fail')
          }
        }
        this.emit('finish')
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

export async function addMemJob(options: IJobOptions) {
  const jobs = await getMemJobs()
  jobs.push(options)
  await setMemStore('jobs', jobs)
}

export async function getMemJobs(): Promise<IJobOptions[]> {
  return (await main.getMemStore('jobs')) || []
}

export async function deleteMemJob(id: number) {
  const jobs = await getMemJobs()
  remove(jobs, (job: IJobOptions) => job.id === id)
  await setMemStore('jobs', jobs)
}

export async function clearMemJobs() {
  await setMemStore('jobs', [])
}

export function getJobTypeText(type: JobType) {
  switch (type) {
    case JobType.Move:
      return t('move')
    case JobType.Sync:
      return t('sync')
  }

  return t('copy')
}

export function getJobStatusText(status: JobStatus) {
  switch (status) {
    case JobStatus.Fail:
      return t('fail')
    case JobStatus.Success:
      return t('success')
    case JobStatus.Cancel:
      return t('cancel')
  }

  return t('running')
}

export const jobColumns = [
  {
    id: 'id',
    title: t('jobId'),
    weight: 5,
    sortable: true,
  },
  {
    id: 'type',
    title: t('type'),
    weight: 5,
    sortable: true,
  },
  {
    id: 'source',
    title: t('source'),
    weight: 10,
    sortable: true,
  },
  {
    id: 'destination',
    title: t('destination'),
    weight: 10,
    sortable: true,
  },
  {
    id: 'startTime',
    title: t('startTime'),
    weight: 10,
  },
  {
    id: 'duration',
    title: t('duration'),
    weight: 5,
  },
  {
    id: 'file',
    title: t('file'),
    weight: 5,
  },
  {
    id: 'size',
    title: t('size'),
    weight: 10,
    sortable: true,
  },
  {
    id: 'speed',
    title: t('speed'),
    weight: 5,
  },
  {
    id: 'status',
    title: t('status'),
    weight: 5,
    sortable: true,
  },
]
