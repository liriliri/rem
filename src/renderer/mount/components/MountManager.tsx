import LunaDataGrid from 'luna-data-grid/react'
import { observer } from 'mobx-react-lite'
import { t } from '../../../common/util'
import Style from './MountManager.module.scss'
import { useResizeSensor } from 'share/renderer/lib/hooks'
import DataGrid from 'luna-data-grid'
import { useRef } from 'react'
import store from '../store'
import map from 'licia/map'

export default observer(function MountManager() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataGridRef = useRef<DataGrid>(null)

  useResizeSensor(containerRef, () => {
    dataGridRef.current?.fit()
  })

  const mounts = map(store.mounts, (mount) => {
    return {
      ...mount,
      status: mount.mounted ? t('mounted') : t('unmounted'),
    }
  })

  return (
    <div ref={containerRef} className={Style.container}>
      <LunaDataGrid
        className={Style.mounts}
        data={mounts}
        onSelect={(node) => {
          const data = node.data as any
          store.selectMount({
            fs: data.fs,
            mountPoint: data.mountPoint,
            mounted: data.mounted,
          })
        }}
        onDeselect={() => store.selectMount(null)}
        columns={columns}
        onCreate={(dataGrid) => {
          dataGridRef.current = dataGrid
          dataGrid.fit()
        }}
        selectable={true}
      />
    </div>
  )
})

const columns = [
  {
    id: 'fs',
    title: t('source'),
    weight: 40,
  },
  {
    id: 'mountPoint',
    title: t('mountPoint'),
    weight: 40,
  },
  {
    id: 'status',
    title: t('status'),
    weight: 20,
  },
]
