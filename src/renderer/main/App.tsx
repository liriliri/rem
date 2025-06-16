import Toolbar from './components/toolbar/Toolbar'
import Config from './components/config/Config'
import File from './components/file/File'
import Style from './App.module.scss'

export default function App() {
  return (
    <>
      <Toolbar />
      <div className={Style.workspace}>
        <Config />
        <File />
      </div>
    </>
  )
}
