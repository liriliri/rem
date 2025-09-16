import { JSX, useEffect, useState } from 'react'
import Style from './Preview.module.scss'
import { IFile } from 'luna-file-list'
import { t } from '../../../../common/util'
import startWith from 'licia/startWith'
import LunaImageViewer from 'luna-image-viewer/react'
import LunaVideoPlayer from 'luna-video-player/react'
import LunaMusicPlayer from 'luna-music-player/react'
import LunaTextViewer from 'luna-text-viewer/react'
import LunaMusicVisualizer from 'luna-music-visualizer/react'
import store from '../../store'
import { observer } from 'mobx-react-lite'
import axios from 'axios'
import isStr from 'licia/isStr'
import truncate from 'licia/truncate'

interface IProps {
  file: IFile | null
}

export default observer(function Preview(props: IProps) {
  const { file } = props
  const { remote } = store
  const [audioObj, setAudioObj] = useState<HTMLAudioElement>(new Audio())

  let preview: JSX.Element = (
    <div className={Style.noPreview}>{t('noPreview')}</div>
  )

  if (store.showPreview) {
    if (!file) {
      preview = <div className={Style.noPreview}>{t('fileNotSelected')}</div>
    } else if (!file.directory) {
      const { name } = file
      const url = remote.getUrl(remote.remote + '/' + name)
      const mime = file.mime
      if (mime) {
        if (mime) {
          if (mime === 'application/pdf') {
            preview = <iframe className={Style.pdfViewer} src={url} />
          } else if (startWith(mime, 'image/')) {
            preview = <LunaImageViewer image={url} />
          } else if (startWith(mime, 'video/')) {
            preview = (
              <LunaVideoPlayer className={Style.videoPlayer} url={url} />
            )
          } else if (startWith(mime, 'audio/')) {
            preview = (
              <div className={Style.musicPlayerContainer}>
                <LunaMusicVisualizer
                  className={Style.musicVisualizer}
                  audio={audioObj}
                  fftSize={256}
                />
                <LunaMusicPlayer
                  className={Style.musicPlayer}
                  audio={{ title: file.name, url }}
                  onCreate={(musicPlayer) => {
                    setAudioObj(musicPlayer.getAudio())
                  }}
                />
              </div>
            )
          } else if (startWith(mime, 'text/')) {
            preview = <TextViewer url={url} />
          }
        }
      }
    }
  }

  return <div className={Style.container}>{preview}</div>
})

interface ITextViewerProps {
  url: string
}

function TextViewer(props: ITextViewerProps) {
  const [text, setText] = useState('')

  useEffect(() => {
    axios.get(props.url).then((response) => {
      if (isStr(response.data)) {
        let text = response.data
        if (text.length > 100000) {
          text = truncate(text, 100000)
        }
        setText(text)
      } else {
        setText(t('commonErr'))
      }
    })
  }, [props.url])

  return <LunaTextViewer text={text} className={Style.textViewer} />
}
