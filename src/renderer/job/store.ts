import {
  clearMemJobs,
  deleteMemJob,
  getMemJobs,
  IJobOptions,
  Job,
  JobStatus,
} from '../store/job'
import BaseStore from 'share/renderer/store/BaseStore'
import some from 'licia/some'
import { makeObservable, observable, runInAction } from 'mobx'
import find from 'licia/find'
import filter from 'licia/filter'
import each from 'licia/each'

class Store extends BaseStore {
  jobs: Job[] = []
  constructor() {
    super()

    makeObservable(this, {
      jobs: observable,
    })

    this.init()
    this.bindEvent()
  }
  deleteJob(id: number) {
    const job = find(this.jobs, (job) => job.id === id)
    if (job) {
      job.stop()
      this.jobs = filter(this.jobs, (job) => job.id !== id)
    }
    deleteMemJob(id)
  }
  clearFinishedJobs() {
    this.jobs = filter(this.jobs, (job) => {
      return job.status === JobStatus.Running
    })
    clearMemJobs()
  }
  private async init() {
    const jobs = await getMemJobs()
    this.updateJobs(jobs)
  }
  private async updateJobs(jobOptions: IJobOptions[]) {
    const { jobs } = this

    each(jobOptions, (options) => {
      if (some(jobs, (job) => job.id === options.id)) {
        return
      }
      jobs.push(new Job(options.id, options.type, options.pair))
    })

    runInAction(() => {
      this.jobs = jobs
    })
  }
  private bindEvent() {
    main.on('changeMemStore', (name, val) => {
      switch (name) {
        case 'jobs':
          this.updateJobs(val)
          break
      }
    })
  }
}

export default new Store()
