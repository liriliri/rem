import axios from 'axios'
import types from 'licia/types'
import singleton from 'licia/singleton'
import { notify } from 'share/renderer/lib/util'
import { t } from '../../../common/util'

type ConfigDump = types.PlainObj<{
  type: string
  provider?: string
}>

export type File = {
  ID: string
  IsDir: boolean
  MimeType: string
  Name: string
  Size: number
  ModTime: string
  Path: string
}

export type Stats = {
  bytes: number
}

const api = axios.create({
  baseURL: 'http://127.0.1:5572',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    notify(t('reqErr'), { icon: 'error' })
    return Promise.reject(error)
  }
)
;(async () => {
  const port = await main.getRclonePort()
  api.defaults.baseURL = `http://127.0.0.1:${port}`
})()

export async function getConfigDump(): Promise<ConfigDump> {
  const response = await api.post<ConfigDump>('/config/dump')

  return response.data
}

export async function getFileList(options: {
  fs: string
  remote: string
}): Promise<File[]> {
  const response = await api.post<{
    list: File[]
  }>('/operations/list', {
    fs: options.fs,
    remote: options.remote,
  })

  return response.data.list
}

export async function stats(): Promise<Stats> {
  const response = await api.post<Stats>('/core/stats')

  return response.data
}

export const wait = singleton(async function (checkInterval = 5) {
  return new Promise((resolve) => {
    async function check() {
      if (!(await main.isRcloneRunning())) {
        return resolve(false)
      }
      try {
        await stats()
        return resolve(true)
      } catch {
        // ignore
      }
      setTimeout(check, checkInterval * 1000)
    }
    check()
  })
})
