import { Machine } from 'xstate'

interface AuthMachineSchema {
  states: {
    checking: {}
    unauthorized: {}
    loading: {}
    logout: {}
    authorized: {}
  }
}

type AuthMachineEvents =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'LOGGED_IN' }

export const authMachine = Machine<{}, AuthMachineSchema, AuthMachineEvents>(
  {
    id: 'auth',
    initial: 'checking',
    states: {
      checking: {
        invoke: {
          src: 'isUserLoggedIn',
          onDone: { target: 'authorized' },
          onError: { target: 'unauthorized' },
        },
      },
      unauthorized: {
        on: {
          LOGGED_IN: 'authorized',
          LOGIN: 'loading',
        },
      },
      loading: {
        // Login Failure here
        invoke: {
          src: 'performLogin',
          onDone: { target: 'authorized' },
          onError: { target: 'unauthorized' },
        },
      },
      logout: {},
      authorized: {
        on: {
          //   LOGIN: 'LO'
          // this should go to unauthorized...,
          LOGOUT: 'logout',
        },
      },
    },
  },
  {
    services: {
      isUserLoggedIn: async (_) => {
        const resp = await fetch(`http://localhost:3000/api/v1/portfolio`, {
          credentials: 'include',
          headers: {
            Authorization: sessionStorage.getItem('SESSION_ID') || '',
          },
        })

        if (resp.ok) {
          return resp.json()
        } else {
          return Promise.reject('Not Logged in')
        }
      },
      performLogin: async (ctx, event: any) => {
        const resp = await fetch(`http://localhost:3000/api/v1/login`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            code: event.code,
          }),
        })

        if (resp.ok) {
          const json = await resp.json()
          sessionStorage.setItem('SESSION_ID', json.id)
          return json
        } else {
          throw new Error('Bad Login')
        }
      },
    },
  }
)
