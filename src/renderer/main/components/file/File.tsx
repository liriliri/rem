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
import PublicLinkModal from './PublicLinkModal'
import MountModal from './MountModal'
import LunaSplitPane, { LunaSplitPaneItem } from 'luna-split-pane/react'
import Preview from './Preview'
import startWith from 'licia/startWith'

export default observer(function File() {
  const [publicLinkModalVisible, setPublicLinkModalVisible] = useState(false)
  const [publicLink, setPublicLink] = useState('')
  const [mountModalVisible, setMountModalVisible] = useState(false)
  const [dropHighlight, setDropHighlight] = useState(false)
  const [selected, setSelected] = useState<IFile | null>(null)
  const draggingRef = useRef(0)

  const { remote } = store

  const files = map(remote.files, (file) => {
    const ret: IFile = {
      name: file.Name,
      directory: file.IsDir,
      mtime: new Date(file.ModTime),
      mime: file.MimeType,
    }
    if (file.Size > 0 || !file.IsDir) {
      ret.size = file.Size
    }

    if (file.Metadata && file.Metadata.thumbnail) {
      const type = file.MimeType
      if (
        !type ||
        (!startWith(type, 'image') &&
          !startWith(type, 'text') &&
          !startWith(type, 'video') &&
          !startWith(type, 'audio'))
      ) {
        ret.thumbnail = file.Metadata.thumbnail
      }
    }

    return ret
  })

  async function open(file: IFile) {
    if (file.directory) {
      remote.go(resolvePath(file.name))
    } else {
      const job = await remote.openFile(resolvePath(file.name))
      store.addJob(job)
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
      ]
      if (file.directory) {
        template.push(
          {
            type: 'separator',
          },
          {
            label: t('selectForSync'),
            click: () => {
              remote.selectSyncFolder(resolvePath(file.name))
            },
          }
        )
        if (await remote.canSync()) {
          template.push({
            label: t('sync'),
            click: async () => {
              const job = await remote.syncFolder(resolvePath(file.name))
              store.addJob(job)
            },
          })
        }
      }
      template.push(
        {
          type: 'separator',
        },
        {
          label: t('copy'),
          click() {
            remote.copyFiles([resolvePath(file.name)])
          },
        },
        {
          label: t('cut'),
          click() {
            remote.cutFiles([resolvePath(file.name)])
          },
        }
      )
      if (file.directory && (await remote.canPaste())) {
        template.push({
          label: t('paste'),
          click: async () => {
            const jobs = await remote.pasteFiles(resolvePath(file.name))
            each(jobs, (job) => store.addJob(job))
          },
        })
      }
      template.push(
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
        },
        {
          label: t('rename'),
          click: async () => {
            const name = await LunaModal.prompt(
              t(file.directory ? 'newFolderName' : 'newFileName'),
              file.name
            )
            if (name && name !== file.name) {
              const job = await remote.renameFile(resolvePath(file.name), name)
              store.addJob(job)
            }
          },
        }
      )
      if (remote.features.PublicLink) {
        template.push(
          {
            type: 'separator',
          },
          {
            label: t('getPublicLink'),
            click: async () => {
              const url = await remote.getPublicLink(resolvePath(file.name))
              setPublicLinkModalVisible(true)
              setPublicLink(url)
            },
          }
        )
      }
      contextMenu(e, template)
    } else {
      const template: any[] = [
        {
          label: t('upload'),
          click: async () => {
            const jobs = await remote.uploadFiles()
            each(jobs, (job) => store.addJob(job))
          },
        },
      ]
      if (remote.type !== 'remdisk') {
        template.push({
          label: t('mount'),
          click: async () => {
            setMountModalVisible(true)
          },
        })
      }
      if (remote.features.CanHaveEmptyDirectories) {
        template.push({
          label: t('newFolder'),
          click: async () => {
            const name = await LunaModal.prompt(t('newFolderName'))
            if (name) {
              remote.newFolder(resolvePath(name))
            }
          },
        })
      }
      template.push(
        {
          type: 'separator',
        },
        {
          label: t('selectForSync'),
          click: () => {
            remote.selectSyncFolder(remote.remote)
          },
        }
      )
      if (await remote.canSync()) {
        template.push({
          label: t('sync'),
          click: async () => {
            const job = await remote.syncFolder()
            store.addJob(job)
          },
        })
      }
      if (await remote.canPaste()) {
        template.push(
          {
            type: 'separator',
          },
          {
            label: t('paste'),
            click: async () => {
              const jobs = await remote.pasteFiles()
              each(jobs, (job) => store.addJob(job))
            },
          }
        )
      }
      contextMenu(e, template)
    }
  }

  return (
    <LunaSplitPane onResize={(weights) => store.setFileWeights(weights)}>
      <LunaSplitPaneItem minSize={400} weight={store.fileWeights[0]}>
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
            onSelect={(file: IFile) => setSelected(file)}
            onDeselect={() => setSelected(null)}
          />
          {remote.isLoading && (
            <div className={Style.loading}>
              <LoadingBar />
            </div>
          )}
        </div>
        <PublicLinkModal
          visible={publicLinkModalVisible}
          onClose={() => setPublicLinkModalVisible(false)}
          url={publicLink}
        />
        <MountModal
          visible={mountModalVisible}
          onClose={() => setMountModalVisible(false)}
        />
      </LunaSplitPaneItem>
      <LunaSplitPaneItem
        minSize={180}
        weight={store.fileWeights[1]}
        visible={store.showPreview}
      >
        <Preview file={selected} />
      </LunaSplitPaneItem>
    </LunaSplitPane>
  )
})
