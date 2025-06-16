import { observer } from 'mobx-react-lite'
import LunaFileList from 'luna-file-list/react'
import Style from './File.module.scss'
import store from '../../store'

export default observer(function File() {
  return (
    <div className={Style.container}>
      <LunaFileList
        className={Style.fileList}
        files={[]}
        listView={store.listView}
      />
    </div>
  )
})
