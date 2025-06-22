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

export default observer(function Job() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  const data = map(store.jobs, (job) => {
    return {
      id: job.id,
      source: job.source,
      status: getStatusText(job.status),
      type: getTypeText(job.type),
      duration: durationFormat(Math.round(job.duration * 1000), 'h:m:s:l'),
      destination: job.destination,
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
    weight: 30,
    sortable: true,
  },
  {
    id: 'destination',
    title: t('destination'),
    weight: 30,
    sortable: true,
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
