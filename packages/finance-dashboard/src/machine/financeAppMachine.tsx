import { assign, createMachine } from 'xstate'
import { Portfolio } from '../types'

interface DashboardContext {
  apiResult: Portfolio
  portfolioItems: Pick<Portfolio, 'portfolioItems'>
  percentagesByType: Record<string, number>
}

export const financeDashboard = createMachine(
  {
    id: 'financeDashboard',
    initial: 'loading',
    context: {
      apiResult: {} as Portfolio,
      portfolioItems: [],
      percentagesByType: {},
    },
    states: {
      loading: {
        invoke: {
          src: 'getPortfolio',
          onDone: { target: 'idle', actions: 'setPortfolioData' },
          onError: { target: 'error' },
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
    },
  },
  {
    services: {
      getPortfolio: async (ctx, event) => {
        const res = await fetch(`http://localhost:3000/api/v1/portfolio`, {
          credentials: 'include',
          headers: {
            Authorization: sessionStorage.getItem('SESSION_ID') || '',
          },
        })

        if (res.ok) {
          const resultJSON: Portfolio = await res.json()

          return resultJSON
        } else {
          throw new Error(
            'I guess i need to login again...maybe send event to parent machine'
          )
        }
      },
    },
    actions: {
      setPortfolioData: assign((_, event: any) => ({
        apiResult: event.data,
        portfolioItems: event.data.portfolioItems,
        percentagesByType: event.data.portfolioItems.reduce((acc, curr) => {
          if (acc[curr.productType]) {
            acc[curr.productType] += curr.totalPositionValue
          } else {
            acc[curr.productType] = curr.totalPositionValue
          }

          return acc
        }, {} as any),
      })),
    },
  }
)
