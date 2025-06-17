import axios from 'axios'
import types from 'licia/types'

type ConfigDump = types.PlainObj<{
  type: string
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

const api = axios.create({
  baseURL: 'http://127.0.1:5572',
  headers: {
    'Content-Type': 'application/json',
  },
})

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
