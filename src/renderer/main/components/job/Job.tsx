import { observer } from 'mobx-react-lite'
import Style from './Job.module.scss'
import LunaDataGrid from 'luna-data-grid/react'
import { t } from '../../../../common/util'
import { useRef } from 'react'
import DataGrid from 'luna-data-grid'
import { useResizeSensor } from 'share/renderer/lib/hooks'

export default observer(function Job() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  return (
    <div className={Style.container} ref={containerRef}>
      <LunaDataGrid
        data={[]}
        columns={columns}
        onCreate={(dataGrid) => {
          dataGridRef.current = dataGrid
          dataGrid.fit()
        }}
      />
    </div>
  )
})

const columns = [
  {
    id: 'id',
    title: t('jobId'),
  },
  {
    id: 'source',
    title: t('source'),
  },
  {
    id: 'destination',
    title: t('destination'),
  },
]
