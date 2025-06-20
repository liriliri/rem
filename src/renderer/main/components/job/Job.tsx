import { observer } from 'mobx-react-lite'
import Style from './Job.module.scss'
import LunaDataGrid from 'luna-data-grid/react'
import { t } from '../../../../common/util'
import { useEffect, useRef } from 'react'
import DataGrid from 'luna-data-grid'
import ResizeSensor from 'licia/ResizeSensor'

export default observer(function Job() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)
  const resizeSensorRef = useRef<ResizeSensor>(null)

  useEffect(() => {
    const resizeSensor = new ResizeSensor(containerRef.current!)
    resizeSensor.addListener(() => {
      dataGridRef.current?.fit()
    })
    resizeSensorRef.current = resizeSensor

    return () => {
      resizeSensor.destroy()
      resizeSensorRef.current = null
    }
  }, [])

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
