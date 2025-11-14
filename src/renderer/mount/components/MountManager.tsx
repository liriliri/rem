import LunaDataGrid from 'luna-data-grid/react'
import { observer } from 'mobx-react-lite'
import { t } from 'common/util'
import Style from './MountManager.module.scss'
import { useWindowResize } from 'share/renderer/lib/hooks'
import DataGrid from 'luna-data-grid'
import { useRef } from 'react'
import store from '../store'
import map from 'licia/map'

export default observer(function MountManager() {
  const dataGridRef = useRef<DataGrid>(null)

  useWindowResize(() => dataGridRef.current?.fit())

  const mounts = map(store.mounts, (mount) => {
    return {
      ...mount,
      status: mount.mounted ? t('mounted') : t('unmounted'),
    }
  })

  return (
    <LunaDataGrid
      className={Style.container}
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
