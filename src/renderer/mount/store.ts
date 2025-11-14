import { action, makeObservable, observable, runInAction } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import * as rclone from 'common/rclone'
import map from 'licia/map'
import some from 'licia/some'
import { setMainStore } from '../lib/util'
import { createMount, deleteMount, IMountRaw } from '../lib/mount'

interface IMount extends IMountRaw {
  mounted: boolean
}

class Store extends BaseStore {
  mounts: IMount[] = []
  mount: IMount | null = null
  constructor() {
    super()
    makeObservable(this, {
      mounts: observable,
      mount: observable,
      selectMount: action,
    })

    this.init()
    this.bindEvent()
  }
  selectMount(mount: IMount | null) {
    this.mount = mount
  }
  async deleteSelected() {
    const { mount } = this

    if (!mount) {
      return
    }

    await deleteMount((fs, mountPoint) => {
      return mount.fs === fs && mount.mountPoint === mountPoint
    })

    this.getMounts()
  }
  async deleteAll() {
    setMainStore('mounts', [])

    await rclone.unmountAll()

    this.getMounts()
  }
  async mountSelected() {
    const { mount } = this

    if (!mount) {
      return
    }

    await createMount(mount.fs, mount.mountPoint)
    this.getMounts()
  }
  async unmountSelected() {
    const { mount } = this

    if (!mount || !mount.mounted) {
      return
    }

    await rclone.removeMount(mount.mountPoint)
    this.getMounts()
  }
  async getMounts() {
    const mounts: IMountRaw[] = (await main.getMainStore('mounts')) || []

    const mountedMounts = await rclone.listMounts()

    runInAction(() => {
      this.mounts = map(mounts, (mount) => {
        return {
          ...mount,
          mounted: some(mountedMounts, (m) => {
            return m.Fs === mount.fs && m.MountPoint === mount.mountPoint
          }),
        }
      })
    })

    this.selectMount(null)
  }
  private async init() {
    if (await rclone.wait()) {
      this.getMounts()
    }
  }
  private async bindEvent() {
    main.on('changeMainStore', (name) => {
      switch (name) {
        case 'mounts':
          this.getMounts()
          break
      }
    })
  }
}

export default new Store()
