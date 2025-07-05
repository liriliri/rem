import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from '../../../../common/util'
import Style from './MountModal.module.scss'
import { useEffect, useState } from 'react'
import isEmpty from 'licia/isEmpty'
import className from 'licia/className'
import isStrBlank from 'licia/isStrBlank'
import store from '../../store'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default function MountModal(props: IProps) {
  const [filePath, setFilePath] = useState('')

  useEffect(() => {
    if (!props.visible) {
      setFilePath('')
    }
  }, [props.visible])

  const browse = async () => {
    const { filePaths } = await main.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    if (!isEmpty(filePaths)) {
      setFilePath(filePaths[0])
    }
  }

  return createPortal(
    <LunaModal
      visible={props.visible}
      onClose={props.onClose}
      width={400}
      title={t('mount')}
    >
      <div className={Style.path}>
        <input
          value={filePath}
          spellCheck={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFilePath(e.target.value)
          }}
        />
        <div className="button primary" onClick={browse}>
          {t('browse')}
        </div>
      </div>
      <div
        className={className('modal-button', 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (isStrBlank(filePath)) {
            return
          }
          store.remote.mount(filePath).then(() => {
            main.openPath(filePath)
          })
          props.onClose()
        }}
      >
        {t('ok')}
      </div>
    </LunaModal>,
    document.body
  )
}
