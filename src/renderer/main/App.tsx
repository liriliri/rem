import Toolbar from './components/toolbar/Toolbar'
import Config from './components/config/Config'
import File from './components/file/File'
import Job from './components/job/Job'
import Style from './App.module.scss'
import LunaSplitPane, { LunaSplitPaneItem } from 'luna-split-pane/react'
import store from './store'
import { observer } from 'mobx-react-lite'

export default observer(function App() {
  return (
    <>
      <Toolbar />
      <LunaSplitPane
        direction="vertical"
        className={Style.workspace}
        onResize={(weights) => {
          const [explorerWeight, jobWeight] = weights
          store.setJobWeight((jobWeight / (explorerWeight + jobWeight)) * 100)
        }}
      >
        <LunaSplitPaneItem
          minSize={200}
          className={Style.explorer}
          weight={100 - store.jobWeight}
        >
          <LunaSplitPane
            onResize={(weights) => {
              const [configWeight, fileWeight] = weights
              store.setConfigWeight(
                (configWeight / (configWeight + fileWeight)) * 100
              )
            }}
          >
            <LunaSplitPaneItem
              minSize={200}
              visible={store.showConfig}
              weight={store.configWeight}
            >
              <Config />
            </LunaSplitPaneItem>
            <LunaSplitPaneItem minSize={400} weight={100 - store.configWeight}>
              <File />
            </LunaSplitPaneItem>
          </LunaSplitPane>
        </LunaSplitPaneItem>
        <LunaSplitPaneItem
          minSize={150}
          weight={store.jobWeight}
          visible={store.showJob}
        >
          <Job />
        </LunaSplitPaneItem>
      </LunaSplitPane>
    </>
  )
})
