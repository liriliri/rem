import { observer } from 'mobx-react-lite'
import Style from './Job.module.scss'
import LunaDataGrid from 'luna-data-grid/react'
import { t } from '../../common/util'
import { useRef } from 'react'
import DataGrid, { DataGridNode } from 'luna-data-grid'
import { useResizeSensor } from 'share/renderer/lib/hooks'
import map from 'licia/map'
import durationFormat from 'licia/durationFormat'
import {
  Job,
  JobStatus,
  getJobStatusText,
  getJobTypeText,
  jobColumns,
} from '../store/job'
import dateFormat from 'licia/dateFormat'
import fileSize from 'licia/fileSize'
import contextMenu from 'share/renderer/lib/contextMenu'
import find from 'licia/find'
import each from 'licia/each'
import toEl from 'licia/toEl'

interface IProps {
  jobs: Job[]
  onDeleteJob: (id: number) => void
  onClearFinishedJobs: () => void
}

export default observer(function Job(props: IProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  const data = map(props.jobs, (job) => {
    const { pair } = job

    const status = toEl(`<span>${getJobStatusText(job.status)}</span>`)
    if (job.status === JobStatus.Fail) {
      status.setAttribute('title', job.error)
    }

    return {
      id: job.id,
      source: `${pair.srcFs}${pair.srcRemote}`,
      destination: `${pair.dstFs}${pair.dstRemote}`,
      status,
      type: getJobTypeText(job.type),
      duration: durationFormat(Math.round(job.duration * 1000), 'h:m:s:l'),
      file: `${job.transferredFiles}/${job.totalFiles}`,
      size: `${fileSize(job.transferredBytes)}B/${fileSize(job.totalBytes)}B`,
      speed: fileSize(job.speed) + 'B/s',
      startTime: dateFormat(job.startTime, 'mm-dd HH:MM:ss'),
    }
  })

  async function onContextMenu(e: MouseEvent, jobId?: number) {
    const template: any[] = []

    if (jobId) {
      const job = find(props.jobs, (job) => job.id === jobId)
      if (job) {
        template.push({
          label: t('delete'),
          click() {
            props.onDeleteJob(jobId)
          },
        })
        if (job.status === JobStatus.Running) {
          template.push({
            label: t('stop'),
            click() {
              job.stop()
            },
          })
        }
        template.push({
          type: 'separator',
        })
      }
    }

    template.push(
      {
        label: t('stopAll'),
        click() {
          each(props.jobs, (job) => job.stop())
        },
      },
      {
        label: t('clearFinished'),
        click() {
          props.onClearFinishedJobs()
        },
      }
    )

    contextMenu(e, template)
  }

  return (
    <div
      className={Style.container}
      ref={containerRef}
      onContextMenu={(e) => {
        onContextMenu(e.nativeEvent)
      }}
    >
      <LunaDataGrid
        data={data}
        uniqueId="id"
        columns={jobColumns}
        selectable={true}
        onContextMenu={(e: MouseEvent, node: DataGridNode) => {
          onContextMenu(e, (node.data as any).id)
        }}
        onCreate={(dataGrid) => {
          dataGridRef.current = dataGrid
          dataGrid.fit()
        }}
      />
    </div>
  )
})
