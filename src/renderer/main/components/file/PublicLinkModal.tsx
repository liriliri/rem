import { createPortal } from 'react-dom'
import LunaModal from 'luna-modal/react'
import { t } from '../../../../common/util'
import Style from './PublicLinkModal.module.scss'
import className from 'licia/className'
import copy from 'licia/copy'
import { useState } from 'react'

interface IProps {
  visible: boolean
  url: string
  onClose: () => void
}

export default function PublicLinkModal(props: IProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  return createPortal(
    <LunaModal
      visible={props.visible}
      onClose={props.onClose}
      width={640}
      title={t('publicLink')}
    >
      <div className={Style.publicLink}>{props.url}</div>
      <div
        className={className('modal-button', 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          copy(props.url)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 1000)
        }}
      >
        {t(showSuccess ? 'copied' : 'copy')}
      </div>
    </LunaModal>,
    document.body
  )
}
