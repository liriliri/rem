import { observer } from 'mobx-react-lite'
import LunaFileList from 'luna-file-list/react'
import { IFile } from 'luna-file-list'
import Style from './File.module.scss'
import store from '../../store'
import map from 'licia/map'
import { LoadingBar } from 'share/renderer/components/loading'
import { t } from '../../../../common/util'
import contextMenu from 'share/renderer/lib/contextMenu'
import LunaModal from 'luna-modal'

export default observer(function File() {
  const { remote } = store

  const files = map(remote.files, (file) => {
    return {
      name: file.Name,
      directory: file.IsDir,
      mtime: new Date(file.ModTime),
      size: file.Size,
    }
  })

  function open(file: IFile) {
    if (file.directory) {
      remote.go(resolvePath(file.name))
    }
  }

  function resolvePath(name: string) {
    return remote.remote + (remote.remote ? '/' : '') + name
  }

  function onContextMenu(e: MouseEvent, file?: IFile) {
    if (file) {
      const template: any[] = [
        {
          label: t('open'),
          click: () => open(file),
        },
      ]
      template.push(
        {
          type: 'separator',
        },
        {
          label: t('delete'),
          click: async () => {
            const result = await LunaModal.confirm(
              t('deleteFileConfirm', { name: file.name })
            )
            if (result) {
              const filePath = resolvePath(file.name)
              if (file.directory) {
                remote.deleteFolder(filePath)
              } else {
                remote.deleteFile(filePath)
              }
            }
          },
        }
      )
      contextMenu(e, template)
    } else {
      const template: any[] = [
        {
          label: t('newFolder'),
          click: async () => {
            const name = await LunaModal.prompt(t('newFolderName'))
            if (name) {
              remote.newFolder(resolvePath(name))
            }
          },
        },
      ]
      contextMenu(e, template)
    }
  }

  return (
    <div className={Style.container}>
      <LunaFileList
        className={Style.fileList}
        files={files}
        filter={remote.filter}
        listView={store.listView}
        onDoubleClick={(e: MouseEvent, file: IFile) => open(file)}
        onContextMenu={onContextMenu}
      />
      {remote.isLoading && (
        <div className={Style.loading}>
          <LoadingBar />
        </div>
      )}
    </div>
  )
})
