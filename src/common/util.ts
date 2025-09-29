import defaults from 'licia/defaults'
import enUS from './langs/en-US.json'
import zhCN from './langs/zh-CN.json'
import { init as initI18n } from 'share/common/i18n'
export { t, i18n, hasLocale } from 'share/common/i18n'

const langs = {
  'en-US': enUS,
  'zh-CN': defaults(zhCN, enUS),
}

initI18n(langs)
