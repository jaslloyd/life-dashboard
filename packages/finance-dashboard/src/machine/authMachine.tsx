import { Machine, assign } from 'xstate'

interface AuthMachineSchema {
  states: {
    checking: {}
    unauthorized: {}
    signup: {}
    loading: {}
    logout: {}
    authorized: {}
  }
}

type AuthMachineEvents =
  | { type: 'LOGIN'; code: string }
  | { type: 'LOGOUT' }
  | { type: 'LOGGED_IN' }
  | { type: 'SIGNUP' }
  | { type: 'REFRESH_TOKEN' }

interface AuthMachineContext {
  message: string
  level: 'ERROR' | 'SUCCESS' | ''
}

const authMachine = Machine<
  AuthMachineContext,
  AuthMachineSchema,
  AuthMachineEvents
>({
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
        SIGNUP: 'signup',
      },
    },
    signup: {
      invoke: {
        src: 'doSignup',
        onDone: { target: 'unauthorized' },
        onError: { target: 'unauthorized', actions: 'onError' },
      },
    },
    loading: {
      invoke: {
        src: 'doLogin',
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
        REFRESH_TOKEN: 'checking',
      },
    },
  },
})

export const authMachineWithConfig = authMachine.withConfig({
  services: {
    doSignup: () => {
      return Promise.resolve('Signed up')
    },
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
    doLogin: async (_, event: any) => {
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
    onError: assign((ctx, event: any) => ({
      message: event.data.toString(),
      level: 'ERROR',
    })),
    onSuccess: assign((ctx, event: any) => ({
      user: event.data.user,
      message: event.data,
    })),
  },
})
