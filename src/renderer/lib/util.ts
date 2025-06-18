import { isObservable, toJS } from 'mobx'

export async function setMainStore(name: string, val: any) {
  await main.setMainStore(name, isObservable(val) ? toJS(val) : val)
}
