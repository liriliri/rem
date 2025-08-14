import getUrlParam from 'licia/getUrlParam'
import { action, makeObservable, observable } from 'mobx'
import BaseStore from 'share/renderer/store/BaseStore'
import last from 'licia/last'

class Store extends BaseStore {
  url = ''
  constructor() {
    super()

    makeObservable(this, {
      url: observable,
      setUrl: action,
    })

    this.setUrl(getUrlParam('videoUrl') || '')

    this.bindEvent()
  }
  setUrl(url: string) {
    this.url = url
    preload.setTitle(last(url.split('/')))
  }
  private bindEvent() {
    main.on('setVideoUrl', (url: string) => this.setUrl(url))
  }
}

export default new Store()
