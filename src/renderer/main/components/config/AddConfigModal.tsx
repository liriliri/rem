import LunaModal from 'luna-modal/react'
import { createPortal } from 'react-dom'
import { t } from 'common/util'
import { Checkbox, Input, Row, Select } from 'share/renderer/components/setting'
import { JSX, useEffect, useState } from 'react'
import types from 'licia/types'
import each from 'licia/each'
import store from '../../store'
import className from 'licia/className'
import isStrBlank from 'licia/isStrBlank'
import find from 'licia/find'
import map from 'licia/map'
import filter from 'licia/filter'
import { Provider } from 'common/rclone'
import { notify } from 'share/renderer/lib/util'
import isUndef from 'licia/isUndef'

interface IProps {
  visible: boolean
  onClose: () => void
}

export default function AddConfigModal(props: IProps) {
  const [name, setName] = useState('')
  const [providerName, setProviderName] = useState('')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [parameters, setParameters] = useState<types.PlainObj<any>>({})

  useEffect(() => {
    if (props.visible) {
      setName('')
      setProviderName('local')
      setProvider(find(store.providers, (p) => p.Name === 'local') || null)
      setParameters({})
    }
  }, [props.visible])

  const providers: types.PlainObj<string> = {}
  each(store.providers, (provider) => {
    providers[provider.Description] = provider.Name
  })

  let options: JSX.Element[] = []
  if (provider) {
    options = map(
      filter(provider.Options, (option) => {
        if (providerName === 's3' && option.Provider) {
          return option.Provider === parameters['provider']
        }

        return !option.Advanced
      }),
      (option) => {
        let el: JSX.Element | null = null
        const { Type, Examples, Help, Default } = option

        function getValue() {
          return parameters[option.Name]
        }
        function setValue(value: any) {
          setParameters({
            ...parameters,
            [option.Name]: value,
          })
        }

        const title = Help.split('\n')[0]
        if (Type === 'string') {
          if (Examples) {
            const options: types.PlainObj<string> = {}
            each(Examples, (example) => {
              options[example.Help] = example.Value
            })
            el = (
              <Select
                title={title}
                value={getValue() || Examples[0].Value}
                options={options}
                onChange={setValue}
              />
            )
          } else {
            el = (
              <Input
                title={title}
                value={getValue() || Default}
                onChange={setValue}
              />
            )
          }
        } else if (Type === 'bool') {
          let val = getValue()
          if (isUndef(val)) {
            val = Default
          }
          let description = ''
          if (Examples) {
            const example = find(Examples, (ex) => ex.Value === val)
            if (example) {
              description = example.Help
            }
          }
          el = (
            <Checkbox
              title={title}
              value={val}
              description={description}
              onChange={setValue}
            />
          )
        }

        return (
          <Row className="modal-setting-row" key={option.Name}>
            {el}
          </Row>
        )
      }
    )
  }

  return createPortal(
    <LunaModal
      title={t('addConfig')}
      visible={props.visible}
      onClose={props.onClose}
      width={640}
    >
      <Row className="modal-setting-row">
        <Input
          title={t('name')}
          value={name}
          onChange={(name) => setName(name)}
        />
        <Select
          title={t('provider')}
          value={providerName}
          options={providers}
          onChange={(name) => {
            const provider = find(store.providers, (p) => p.Name === name)
            if (provider) {
              const parameters: types.PlainObj<any> = {}
              each(provider.Options, (option) => {
                parameters[option.Name] = option.Default
              })
              setProvider(provider)
              setProviderName(name)
            }
          }}
        />
      </Row>
      {options}
      <div
        className={className('modal-button', 'button', 'primary')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={async () => {
          if (isStrBlank(name)) {
            notify(t('nameRequired'), { icon: 'error' })
            return
          }

          await store.createConfig(name, providerName, parameters)
          props.onClose()
        }}
      >
        {t('add')}
      </div>
    </LunaModal>,
    document.body
  )
}
