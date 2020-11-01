import { Machine, assign } from 'xstate'

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
  | { type: 'LOGIN'; code: string }
  | { type: 'LOGOUT' }
  | { type: 'LOGGED_IN' }

interface AuthMachineContext {
  message: string
  level: 'ERROR' | 'SUCCESS' | ''
}

export const authMachine = Machine<
  AuthMachineContext,
  AuthMachineSchema,
  AuthMachineEvents
>(
  {
    id: 'authentication',
    initial: 'checking',
    context: {
      message: '',
      level: '',
    },
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
        invoke: {
          src: 'performLogin',
          onDone: { target: 'authorized' },
          onError: { target: 'unauthorized', actions: ['onError', 'log'] },
        },
      },
      logout: {
        entry: 'doLogout',
        on: {
          LOGIN: 'loading',
        },
      },
      authorized: {
        on: {
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
      performLogin: async (_, event: any) => {
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
    actions: {
      log: (ctx, event) => {
        console.log({ ctx, event })
      },
      doLogout: (ctx, event) => {
        sessionStorage.removeItem('SESSION_ID')
      },
      onError: assign((ctx: AuthMachineContext, event: any) => ({
        message: event.data.toString(),
        level: 'ERROR',
      })),
    },
  }
)
