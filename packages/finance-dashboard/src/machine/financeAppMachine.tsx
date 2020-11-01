import { assign, createMachine } from 'xstate'
import { Portfolio, PortfolioItem } from '../types'

interface DashboardContext {
  lastTimeUpdate: string
  apiResult: Portfolio
  portfolioItems: PortfolioItem[]
  percentagesByType: Record<string, number>
}

export const financeDashboard = createMachine<DashboardContext>(
  {
    id: 'financeDashboard',
    initial: 'loading',
    context: {
      lastTimeUpdate: new Date().toISOString(),
      apiResult: {
        overBETotalInEuro: 0,
        overallTotalInEuro: 0,
        portfolioItems: [],
      },
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
          FILTER: {
            // An event with no 'on' is a self transition
            actions: ['filterDate', 'log'],
          },
        },
      },
      error: {
        type: 'final',
      },
    },
  },
  {
    services: {
      getPortfolio: async (_) => {
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
        lastTimeUpdate: new Date().toISOString(),
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
      log: (ctx, event) => {
        console.log({ ctx, event })
      },
      filterDate: assign((ctx, event: any) => ({
        portfolioItems: ctx.apiResult.portfolioItems.filter(
          (item) =>
            item.tickerSymbol.toLowerCase().includes(event.value) ||
            item.name.toLowerCase().includes(event.value)
        ),
      })),
    },
  }
)
