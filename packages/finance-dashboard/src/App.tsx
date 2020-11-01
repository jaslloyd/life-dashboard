import React from 'react'
import DashboardShell from 'dashboardshell/DashboardShell'
import FinanceApp from './FinanceApp'
import Login from './Login'
import './index.css'
import { useMachine } from '@xstate/react'
import { authMachine } from './machine/authMachine'

const App: React.FC = () => {
  const [current, send] = useMachine(authMachine)
  return (
    <DashboardShell>
      <span className="state">{current.value}</span>
      <h1>Finance Application</h1>
      <div className={`alert ${current.context.level}`}>
        {current.context.message}
      </div>
      {current.matches('checking') && <h1>Loading...</h1>}
      {current.matches('authorized') && <FinanceApp />}
      {current.matches('unauthorized') && (
        <Login onSubmit={(code) => send('LOGIN', { code })} />
      )}
    </DashboardShell>
  )
}

export default App
