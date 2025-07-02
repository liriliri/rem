import { observer } from 'mobx-react-lite'
import Style from './Job.module.scss'
import LunaDataGrid from 'luna-data-grid/react'
import { t } from '../../../../common/util'
import { useRef } from 'react'
import DataGrid, { DataGridNode } from 'luna-data-grid'
import { useResizeSensor } from 'share/renderer/lib/hooks'
import map from 'licia/map'
import store from '../../store'
import durationFormat from 'licia/durationFormat'
import { JobStatus, JobType } from '../../store/job'
import dateFormat from 'licia/dateFormat'
import fileSize from 'licia/fileSize'
import contextMenu from 'share/renderer/lib/contextMenu'

export default observer(function Job() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  const data = map(store.jobs, (job) => {
    const { pair } = job

    return {
      id: job.id,
      source: `${pair.srcFs}${pair.srcRemote}`,
      destination: `${pair.dstFs}${pair.dstRemote}`,
      status: getStatusText(job.status),
      type: getTypeText(job.type),
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
      const job = store.getJob(jobId)
      if (job) {
        template.push({
          label: t('delete'),
          click() {
            store.deleteJob(jobId)
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
          store.stopAllJobs()
        },
      },
      {
        label: t('clearFinished'),
        click() {
          store.clearFinishedJobs()
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
        columns={columns}
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

function getTypeText(type: JobType) {
  switch (type) {
    case JobType.Move:
      return t('move')
    case JobType.Sync:
      return t('sync')
  }

  return t('copy')
}

function getStatusText(status: JobStatus) {
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

const columns = [
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
