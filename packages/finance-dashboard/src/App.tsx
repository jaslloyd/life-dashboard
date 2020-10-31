import React from 'react'
import DashboardShell from 'dashboardshell/DashboardShell'
import FinanceApp from './FinanceApp'
import Login from './Login'
import './index.css'
import { useMachine } from '@xstate/react'
import { authMachine } from './machine/authMachine'

const App: React.FC = () => {
  const [current, send] = useMachine(authMachine)
  const handleLogin = async (code: string) => {
    try {
      const resp = await fetch(`http://localhost:3000/api/v1/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          code,
        }),
      })

      if (resp.ok) {
        const json = await resp.json()
        sessionStorage.setItem('SESSION_ID', json.id)
        send('LOGGED_IN')
      } else {
        console.log('Response was not valid...')
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <DashboardShell>
      {console.log(current.value)}
      <h1>Finance Application</h1>
      {current.matches('checking') && <h1>Loading...</h1>}
      {current.matches('authorized') && <FinanceApp />}
      {current.matches('unauthorized') && <Login onSubmit={handleLogin} />}
    </DashboardShell>
  )
}

export default App
