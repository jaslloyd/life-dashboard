import { createMachine } from 'xstate'

export const fetchMachine = createMachine({
  id: 'financeApp',
  initial: 'loading',
  context: {
    retries: 0,
  },
  states: {
    loading: {
      on: {
        SUCCESS: 'idle',
        ERROR: 'error',
        ERROR_LOGIN: 'showLogin',
      },
    },
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    error: {
      type: 'final',
    },
    showLogin: {
      on: {
        SUCCESS: 'idle',
        ERROR: 'error',
        ERROR_LOGIN: 'showLogin',
      },
    },
  },
})
