import { assign, Machine, send } from 'xstate'
import { Portfolio, PortfolioItem, StockToBuy } from '../types'

interface FetchMachineSchema {
  states: {
    loading: {}
    idle: {}
    error: {}
  }
}

interface DashboardContext {
  lastTimeUpdate: string
  apiResult: Portfolio
  portfolioItems: PortfolioItem[]
  percentagesByType: Record<string, number>
  investTableRef: any
}

type DashboardEvents = { type: 'FETCH' } | { type: 'FILTER' }

export const investmentTable = Machine<{
  stockToPurchase: StockToBuy[]
  totalPurchasePrice: number
}>(
  {
    id: 'investmentTable',
    initial: 'idle',
    context: {
      stockToPurchase: [],
      totalPurchasePrice: 0,
    },
    states: {
      idle: {
        entry: 'updateAvailableAmount',
        on: {
          ADD: {
            actions: ['addStock', 'updateAvailableAmount'],
          },
          DELETE: {
            actions: ['deleteStock', 'updateAvailableAmount'],
          },
          UPDATE: {
            actions: ['updateStock', 'updateAvailableAmount'],
          },
        },
      },
    },
  },
  {
    actions: {
      log: (ctx, event) => {
        console.log({ ctx, event })
      },
      updateAvailableAmount: assign((ctx, event: any) => ({
        totalPurchasePrice: ctx.stockToPurchase.reduce(
          (acc, curr) => acc + curr.currentStockValue * curr.totalStockToBuy,
          0
        ),
      })),
      addStock: assign((ctx, event: any) => ({
        stockToPurchase: [...ctx.stockToPurchase, event.value],
      })),
      deleteStock: assign((ctx, event: any) => ({
        stockToPurchase: ctx.stockToPurchase.filter(
          (stock) => stock.id !== event.value
        ),
      })),
      updateStock: (ctx, event) => {
        const stockCopy = ctx.stockToPurchase
        const itemToUpdate = stockCopy.findIndex(
          (stock) => stock.id === event.value.id
        )
        stockCopy[itemToUpdate].totalStockToBuy = event.value.totalStockToBuy
        return assign({
          stockToPurchase: stockCopy,
        })
      },
    },
  }
)

export const financeDashboard = Machine<
  DashboardContext,
  FetchMachineSchema,
  DashboardEvents
>(
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
      investTableRef: null,
    },
    states: {
      loading: {
        invoke: {
          src: 'getPortfolio',
          onDone: {
            target: 'idle',
            actions: 'setPortfolioData',
          },
          onError: { target: 'error' },
        },
      },
      idle: {
        on: {
          FETCH: 'loading',
          FILTER: {
            // An event with no 'on' is a self transition
            actions: 'filterDate',
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
