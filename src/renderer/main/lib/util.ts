import splitPath from 'licia/splitPath'
import { Target, TargetPair } from './rclone'
import normalizePath from 'licia/normalizePath'

export function parseLocalPath(path: string): Target {
  path = normalizePath(path)

  const parts = path.split('/')

  return {
    fs: parts.shift() + '/',
    remote: parts.join('/'),
  }
}

export function genTargetPair(
  src: Target,
  dst: Target,
  addDstName = true
): TargetPair {
  let dstRemote = dst.remote
  if (addDstName) {
    dstRemote = dstRemote + (dstRemote ? '/' : '') + splitPath(src.remote).name
  }

  return {
    srcFs: src.fs,
    srcRemote: src.remote,
    dstFs: dst.fs,
    dstRemote,
  }
}
