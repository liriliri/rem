import { observer } from 'mobx-react-lite'
import Style from './Job.module.scss'
import LunaDataGrid from 'luna-data-grid/react'
import { t } from '../../../../common/util'
import { useRef } from 'react'
import DataGrid from 'luna-data-grid'
import { useResizeSensor } from 'share/renderer/lib/hooks'
import map from 'licia/map'
import store from '../../store'
import durationFormat from 'licia/durationFormat'
import { JobStatus } from '../../store/job'
import dateFormat from 'licia/dateFormat'

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
      type: getTypeText(),
      duration: durationFormat(Math.round(job.duration * 1000), 'h:m:s:l'),
      startTime: dateFormat(job.startTime, 'yyyy-MM-dd hh:mm:ss'),
    }
  })

  return (
    <div className={Style.container} ref={containerRef}>
      <LunaDataGrid
        data={data}
        uniqueId="id"
        columns={columns}
        selectable={true}
        onCreate={(dataGrid) => {
          dataGridRef.current = dataGrid
          dataGrid.fit()
        }}
      />
    </div>
  )
})

function getTypeText() {
  return t('copy')
}

function getStatusText(status: JobStatus) {
  switch (status) {
    case JobStatus.Fail:
      return t('fail')
    case JobStatus.Success:
      return t('success')
  }

  return t('running')
}

const columns = [
  {
    id: 'id',
    title: t('jobId'),
    weight: 10,
    sortable: true,
  },
  {
    id: 'type',
    title: t('type'),
    weight: 10,
    sortable: true,
  },
  {
    id: 'source',
    title: t('source'),
    weight: 20,
    sortable: true,
  },
  {
    id: 'destination',
    title: t('destination'),
    weight: 20,
    sortable: true,
  },
  {
    id: 'startTime',
    title: t('startTime'),
    weight: 20,
  },
  {
    id: 'duration',
    title: t('duration'),
    weight: 10,
  },
  {
    id: 'status',
    title: t('status'),
    weight: 10,
    sortable: true,
  },
]
