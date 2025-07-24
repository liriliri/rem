import Toolbar from './components/toolbar/Toolbar'
import Config from './components/config/Config'
import File from './components/file/File'
import Job from '../components/Job'
import Statusbar from './components/statusbar/Statusbar'
import Style from './App.module.scss'
import LunaSplitPane, { LunaSplitPaneItem } from 'luna-split-pane/react'
import store from './store'
import { observer } from 'mobx-react-lite'

export default observer(function App() {
  return (
    <>
      <Toolbar />
      <div className={Style.workspace}>
        <LunaSplitPane
          direction="vertical"
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
                minSize={190}
                visible={store.showConfig}
                weight={store.configWeight}
              >
                <Config />
              </LunaSplitPaneItem>
              <LunaSplitPaneItem
                minSize={640}
                weight={100 - store.configWeight}
              >
                <File />
              </LunaSplitPaneItem>
            </LunaSplitPane>
          </LunaSplitPaneItem>
          <LunaSplitPaneItem
            minSize={150}
            weight={store.jobWeight}
            visible={store.showJob}
          >
            <Job
              jobs={store.jobs}
              onClearFinishedJobs={() => store.clearFinishedJobs()}
              onDeleteJob={(id) => store.deleteJob(id)}
            />
          </LunaSplitPaneItem>
        </LunaSplitPane>
      </div>
      <Statusbar />
    </>
  )
})
