import { useState } from 'react'
import Style from './App.module.scss'
import { t } from 'common/util'
import className from 'licia/className'
import { notify } from 'share/renderer/lib/util'

export default function App() {
  const [password, setPassword] = useState('')

  async function validate() {
    const isValid = await main.validatePassword(password)
    if (!isValid) {
      notify(t('invalidPassword'), { icon: 'error' })
    }
  }

  return (
    <div className={Style.container}>
      <div className={Style.input}>
        <input
          type="password"
          value={password}
          autoFocus
          placeholder={t('enterPassword')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              validate()
            }
          }}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className={Style.buttonGroup}>
        <div
          className={className(Style.button, 'button')}
          onClick={() => main.closePassword()}
        >
          {t('cancel')}
        </div>
        <div
          className={className(Style.button, 'button', 'primary')}
          onClick={validate}
        >
          {t('ok')}
        </div>
      </div>
    </div>
  )
}
