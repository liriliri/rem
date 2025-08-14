import { observer } from 'mobx-react-lite'
import LunaVideoPlayer from 'luna-video-player/react'
import store from './store'
import Style from './App.module.scss'

export default observer(function App() {
  return (
    <LunaVideoPlayer
      className={Style.videoPlayer}
      url={store.url}
      onCreate={(videoPlayer) => {
        videoPlayer.on('canplay', () => videoPlayer.play())
      }}
    />
  )
})
