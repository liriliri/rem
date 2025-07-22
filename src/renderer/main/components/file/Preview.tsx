import { JSX } from 'react'
import Style from './Preview.module.scss'
import { IFile } from 'luna-file-list'
import { t } from '../../../../common/util'
import mime from 'licia/mime'
import lowerCase from 'licia/lowerCase'
import splitPath from 'licia/splitPath'
import startWith from 'licia/startWith'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaVideoPlayer from 'luna-video-player/react'
import LunaMusicPlayer from 'luna-music-player/react'
import store from '../../store'
import { observer } from 'mobx-react-lite'

interface IProps {
  file: IFile | null
}

export default observer(function Preview(props: IProps) {
  const { file } = props
  const { remote } = store

  let preview: JSX.Element = (
    <div className={Style.noPreview}>{t('noPreview')}</div>
  )

  if (store.showPreview) {
    if (!file) {
      preview = <div className={Style.noPreview}>{t('fileNotSelected')}</div>
    } else if (!file.directory) {
      const { name } = file
      const url = remote.getUrl(remote.remote + '/' + name)
      const ext = splitPath(file.name).ext
      if (ext) {
        const mimeType = mime(lowerCase(ext.slice(1)))
        if (mimeType) {
          if (startWith(mimeType, 'image/')) {
            preview = <LunaImageViewer image={url} />
          } else if (startWith(mimeType, 'video/')) {
            preview = (
              <LunaVideoPlayer className={Style.videoPlayer} url={url} />
            )
          } else if (startWith(mimeType, 'audio/')) {
            preview = (
              <LunaMusicPlayer
                className={Style.musicPlayer}
                audio={{ title: file.name, url }}
              />
            )
          }
        }
      }
    }
  }

  return <div className={Style.container}>{preview}</div>
})
