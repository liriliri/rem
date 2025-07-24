import { observer } from 'mobx-react-lite'
import store from './store'
import Job from '../components/Job'

export default observer(function App() {
  return (
    <Job
      jobs={store.jobs}
      onClearFinishedJobs={() => store.clearFinishedJobs()}
      onDeleteJob={(id) => store.deleteJob(id)}
    />
  )
})
