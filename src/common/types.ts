export type IpcGetRclonePort = () => number
export type IpcGetRcloneAuth = () => string
export type IpcIsRcloneRunning = () => boolean
export type IpcNewWindow = (name?: string) => void
export type IpcGetWindowsDrives = () => Promise<string[]>
export type IpcShowVideo = (url: string) => void
export type IpcValidatePassword = (password: string) => Promise<boolean>
