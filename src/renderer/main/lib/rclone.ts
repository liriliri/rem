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

export type OperationOptions = {
  fs: string
  remote: string
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

export async function deleteConfig(name: string) {
  await api.post('/config/delete', {
    name,
  })
}

export async function getFileList(options: OperationOptions): Promise<File[]> {
  const response = await api.post<{
    list: File[]
  }>('/operations/list', options)

  return response.data.list
}

export async function mkdir(options: OperationOptions) {
  await api.post('/operations/mkdir', options)
}

export async function purge(options: OperationOptions) {
  await api.post('/operations/purge', options)
}

export async function deleteFile(options: OperationOptions) {
  await api.post('/operations/deletefile', options)
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
