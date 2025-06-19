import { observer } from 'mobx-react-lite'
import LunaFileList from 'luna-file-list/react'
import { IFile } from 'luna-file-list'
import Style from './File.module.scss'
import store from '../../store'
import map from 'licia/map'
import { LoadingBar } from 'share/renderer/components/loading'
import { t } from '../../../../common/util'
import contextMenu from 'share/renderer/lib/contextMenu'

export default observer(function File() {
  const files = map(store.remote.files, (file) => {
    return {
      name: file.Name,
      directory: file.IsDir,
      mtime: new Date(file.ModTime),
      size: file.Size,
    }
  })

  function open(file: IFile) {
    if (file.directory) {
      const { remote } = store
      remote.go(remote.remote + (remote.remote ? '/' : '') + file.name)
    }
  }

  function onContextMenu(e: MouseEvent, file?: IFile) {
    if (file) {
      const template: any[] = [
        {
          label: t('open'),
          click: () => open(file),
        }
      ]
      contextMenu(e, template)
    }
  }

  return (
    <div className={Style.container}>
      <LunaFileList
        className={Style.fileList}
        files={files}
        listView={store.listView}
        onDoubleClick={(e: MouseEvent, file: IFile) => open(file)}
        onContextMenu={onContextMenu}
      />
      {store.remote.isLoading && (
        <div className={Style.loading}>
          <LoadingBar />
        </div>
      )}
    </div>
  )
})
