import axios from 'axios'
import types from 'licia/types'
import singleton from 'licia/singleton'
import isBrowser from 'licia/isBrowser'

export type Config = {
  type: string
  provider?: string
  url?: string
}

type ConfigDump = types.PlainObj<Config>

type ConfigPaths = {
  config: string
  cache: string
  temp: string
}

export type Mount = {
  Fs: string
  MountPoint: string
  MountedOn: string
}

export type About = {
  total?: number
  used?: number
  free?: number
  trashed?: number
  other?: number
}

export type Features = {
  About: boolean
  PublicLink: boolean
  CanHaveEmptyDirectories: boolean
}

export type FsInfo = {
  Name: string
  Features: Features
}

export type File = {
  ID: string
  IsDir: boolean
  MimeType: string
  Name: string
  Size: number
  ModTime: string
  Path: string
  Metadata?: any
}

export type Stats = {
  bytes: number
  totalBytes: number
  transfers: number
  totalTransfers: number
}

export type Transfer = {
  name: string
  size: number
  bytes: number
}

export type Target = {
  fs: string
  remote: string
}

export type TargetPair = {
  srcFs: string
  srcRemote: string
  dstFs: string
  dstRemote: string
}

type OperationAsyncResult = {
  jobid: number
}

type JobStatus = {
  finished: boolean
  success: boolean
  startTime: string
  duration: number
}

type ProviderOption = {
  Name: string
  Help: string
  Advanced: boolean
  Required: boolean
  Default: string | boolean | number
  DefaultStr: string
  Type: 'string'
  Provider?: string
  Examples?: Array<{
    Value: string
    Help: string
  }>
}

export type Provider = {
  Name: string
  Description: string
  Options: ProviderOption[]
}

export function getBaseURL() {
  return api.defaults.baseURL
}

const api = axios.create({
  baseURL: `http://127.0.1:5572`,
  headers: {
    'Content-Type': 'application/json',
  },
  proxy: false,
})

export async function getConfigDump(): Promise<ConfigDump> {
  const response = await api.post<ConfigDump>('/config/dump')

  return response.data
}

export async function getConfig(name: string): Promise<Config> {
  const response = await api.post<Config>('/config/get', {
    name,
  })

  return response.data
}

export async function deleteConfig(name: string) {
  await api.post('/config/delete', {
    name,
  })
}

export async function getFileList(target: Target): Promise<File[]> {
  const response = await api.post<{
    list: File[]
  }>('/operations/list', {
    ...target,
    opt: {
      metadata: true,
    },
  })

  return response.data.list
}

export async function getFileStat(target: Target): Promise<File> {
  const response = await api.post<{
    item: File
  }>('/operations/stat', target)

  return response.data.item
}

export async function mkdir(target: Target) {
  await api.post('/operations/mkdir', target)
}

export async function purge(target: Target) {
  await api.post('/operations/purge', target)
}

export async function deleteFile(target: Target) {
  await api.post('/operations/deletefile', target)
}

export async function copyFile(targetPair: TargetPair): Promise<number> {
  const response = await api.post<OperationAsyncResult>(
    '/operations/copyfile',
    {
      ...targetPair,
      _async: true,
    }
  )

  return response.data.jobid
}

export async function copyDir(targetPair: TargetPair): Promise<number> {
  const response = await api.post<OperationAsyncResult>('/sync/copy', {
    srcFs: targetPair.srcFs + targetPair.srcRemote,
    dstFs: targetPair.dstFs + targetPair.dstRemote,
    _async: true,
    createEmptySrcDirs: true,
  })

  return response.data.jobid
}

export async function moveFile(targetPair: TargetPair): Promise<number> {
  const response = await api.post<OperationAsyncResult>(
    '/operations/movefile',
    {
      ...targetPair,
      _async: true,
    }
  )

  return response.data.jobid
}

export async function moveDir(targetPair: TargetPair): Promise<number> {
  const response = await api.post<OperationAsyncResult>('/sync/move', {
    srcFs: targetPair.srcFs + targetPair.srcRemote,
    dstFs: targetPair.dstFs + targetPair.dstRemote,
    _async: true,
    createEmptySrcDirs: true,
    deleteEmptySrcDirs: true,
  })

  return response.data.jobid
}

export async function syncDir(targetPair: TargetPair): Promise<number> {
  const response = await api.post<OperationAsyncResult>('/sync/sync', {
    srcFs: targetPair.srcFs + targetPair.srcRemote,
    dstFs: targetPair.dstFs + targetPair.dstRemote,
    _async: true,
    createEmptySrcDirs: true,
  })

  return response.data.jobid
}

export async function createPublicLink(target: Target): Promise<string> {
  const response = await api.post<{ url: string }>(
    '/operations/publiclink',
    target
  )

  return response.data.url
}

export async function getStatusForJob(jobId: number): Promise<JobStatus> {
  const response = await api.post<JobStatus>('/job/status', {
    jobid: jobId,
  })

  return response.data
}

export async function stats(jobId?: number): Promise<Stats> {
  const data: any = {}
  if (jobId) {
    data.group = `job/${jobId}`
  }

  const response = await api.post<Stats>('/core/stats', data)

  return response.data
}

export async function transferred(jobId: number): Promise<Transfer[]> {
  const response = await api.post<{
    transferred: Transfer[]
  }>('/core/transferred', {
    group: `job/${jobId}`,
  })

  return response.data.transferred
}

export async function stopJob(jobId: number) {
  await api.post('/job/stop', {
    jobid: jobId,
  })
}

export async function getAbout(fs: string): Promise<About> {
  const response = await api.post<About>('/operations/about', { fs })

  return response.data
}

export async function getFsInfo(fs: string): Promise<FsInfo> {
  const response = await api.post<FsInfo>('/operations/fsinfo', { fs })

  return response.data
}

export async function createMount(fs: string, mountPoint: string) {
  await api.post('/mount/mount', {
    fs,
    mountPoint,
  })
}

export async function removeMount(mountPoint: string) {
  await api.post('/mount/unmount', {
    mountPoint,
  })
}

export async function unmountAll() {
  await api.post('/mount/unmountall')
}

export async function listMounts(): Promise<Mount[]> {
  const response = await api.post<{
    mountPoints: Mount[]
  }>('/mount/listmounts', {})

  return response.data.mountPoints
}

export async function getProviders(): Promise<Provider[]> {
  const response = await api.post<{
    providers: Provider[]
  }>('/config/providers')

  return response.data.providers
}

export interface ICreateConfigOptions {
  NonInteractive?: boolean
}

export async function createConfig(
  name: string,
  type: string,
  parameters: types.PlainObj<any>,
  opt: ICreateConfigOptions = {}
) {
  await api.post('/config/create', {
    name,
    type,
    parameters,
    opt,
  })
}

export async function getConfigPaths(): Promise<ConfigPaths> {
  const response = await api.post<ConfigPaths>('/config/paths')

  return response.data
}

export async function getRcloneVersion(): Promise<string> {
  const response = await api.post<{ version: string }>('/core/version', {})

  return response.data.version
}

export const wait = singleton(async function (checkInterval = 5) {
  return new Promise((resolve) => {
    async function check() {
      if (isBrowser) {
        if (!(await main.isRcloneRunning())) {
          return resolve(false)
        }
      }
      if (isInit) {
        try {
          await getRcloneVersion()
          return resolve(true)
        } catch {
          // ignore
        }
      }
      setTimeout(check, checkInterval * 1000)
    }
    check()
  })
})

let isInit = false
export function init(port: number, auth: string) {
  isInit = true

  api.defaults.baseURL = `http://127.0.0.1:${port}`
  api.defaults.headers.common['Authorization'] = `Basic ${auth}`

  return api
}
