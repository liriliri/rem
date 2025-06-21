export type IpcGetRclonePort = () => number
export type IpcIsRcloneRunning = () => boolean
export type IpcNewWindow = (name?: string) => void
export type IpcGetWindowsDrives = () => Promise<string[]>
