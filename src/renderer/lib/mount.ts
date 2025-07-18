import unique from 'licia/unique'
import { setMainStore } from './util'
import * as rclone from '../../common/rclone'
import remove from 'licia/remove'
import some from 'licia/some'
import isWindows from 'licia/isWindows'

export interface IMountRaw {
  fs: string
  mountPoint: string
}

export async function addMount(fs: string, mountPoint: string) {
  await rclone.createMount(fs, mountPoint)
  let mounts: IMountRaw[] = (await main.getMainStore('mounts')) || []
  mounts.push({ fs, mountPoint })
  mounts = unique(mounts, (a, b) => {
    return a.fs === b.fs && a.mountPoint === b.mountPoint
  })
  setMainStore('mounts', mounts)
}

export async function deleteMount(
  predicate: (fs: string, mountPoint: string) => boolean
) {
  const mounts: IMountRaw[] = (await main.getMainStore('mounts')) || []
  const mountedMounts = await rclone.listMounts()
  remove(mounts, (mount) => {
    if (predicate(mount.fs, mount.mountPoint)) {
      if (
        some(mountedMounts, (m) => {
          return m.Fs === mount.fs && m.MountPoint === mount.mountPoint
        })
      ) {
        rclone.removeMount(mount.mountPoint)
      }
      return true
    }
    return false
  })
  setMainStore('mounts', mounts)
}

export async function createMount(
  fs: string,
  mountPoint: string
): Promise<void> {
  if (node.existsSync(mountPoint)) {
    if (isWindows) {
      if (
        (await node.isDir(mountPoint)) &&
        (await node.isEmptyDir(mountPoint))
      ) {
        await node.rmdir(mountPoint)
      }
    }
  } else {
    if (!isWindows) {
      await node.mkdir(mountPoint, { recursive: true })
    }
  }
  await rclone.createMount(fs, mountPoint)
}
