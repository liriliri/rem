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
import { useRef, useState } from 'react'
import className from 'licia/className'
import { isFileDrop } from 'share/renderer/lib/util'
import each from 'licia/each'

export default observer(function File() {
  const [dropHighlight, setDropHighlight] = useState(false)
  const draggingRef = useRef(0)

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

  async function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDropHighlight(false)
    const files = e.dataTransfer.files
    const filePaths: string[] = []
    for (let i = 0, len = files.length; i < len; i++) {
      filePaths.push(preload.getPathForFile(files[i]))
    }
    const jobs = await remote.uploadFiles(filePaths)
    each(jobs, (job) => store.addJob(job))
  }

  function resolvePath(name: string) {
    return remote.remote + (remote.remote ? '/' : '') + name
  }

  async function onContextMenu(e: MouseEvent, file?: IFile) {
    if (file) {
      const template: any[] = [
        {
          label: t('open'),
          click: () => open(file),
        },
        {
          label: t('download'),
          click: async () => {
            const jobs = await remote.downloadFiles([resolvePath(file.name)])
            each(jobs, (job) => store.addJob(job))
          },
        },
        {
          type: 'separator',
        },
        {
          label: t('copy'),
          click() {
            remote.copyFiles([resolvePath(file.name)])
          },
        },
      ]
      if (file.directory && (await remote.canPaste())) {
        template.push({
          label: t('paste'),
          click: async () => {
            const jobs = await remote.pasteFiles(resolvePath(file.name))
            each(jobs, (job) => store.addJob(job))
          },
        })
      }
      template.push({
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
      })
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
      if (await remote.canPaste()) {
        template.push({
          label: t('paste'),
          click: async () => {
            const jobs = await remote.pasteFiles()
            each(jobs, (job) => store.addJob(job))
          },
        })
      }
      contextMenu(e, template)
    }
  }

  return (
    <div
      onDrop={onDrop}
      onDragEnter={() => {
        draggingRef.current++
      }}
      onDragLeave={() => {
        draggingRef.current--
        if (draggingRef.current === 0) {
          setDropHighlight(false)
        }
      }}
      onDragOver={(e) => {
        if (!isFileDrop(e)) {
          return
        }
        e.preventDefault()
        if (!remote.isLoading) {
          setDropHighlight(true)
        }
      }}
      className={className(Style.container, {
        [Style.highlight]: dropHighlight,
      })}
    >
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
