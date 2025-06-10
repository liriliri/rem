import I18n from 'licia/I18n'
import defaults from 'licia/defaults'
import types from 'licia/types'
import enUS from './langs/en-US.json'
import zhCN from './langs/zh-CN.json'

const langs = {
  'en-US': enUS,
  'zh-CN': defaults(zhCN, enUS),
}

export const i18n = new I18n('en-US', langs)

export function hasLocale(locale: string) {
  return !!langs[locale]
}

export function t(path: string | string[], data?: types.PlainObj<any>) {
  return i18n.t(path, data)
}
