import splitPath from 'licia/splitPath'
import { Target, TargetPair } from 'common/rclone'

export function parseLocalPath(path: string): Target {
  const [fs, ...remote] = path.split('/')

  return {
    fs: fs + '/',
    remote: remote.join('/'),
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
