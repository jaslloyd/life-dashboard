import React from 'react'
import { Tile, SkeltonTile } from './Tile'
import Login from './Login'
import InvestTotals from './InvestTotals'
import BuyTable from './BuyTable'
import InvestmentTable from './InvestmentTable'
import { Doughnut } from 'react-chartjs-2'
import { Portfolio, PortfolioItem, StockToBuy } from './types'
import { fetchMachine } from './machine/financeAppMachine'
import { useMachine } from '@xstate/react'
import { send } from 'xstate'
const AVAILABLE_FUNDS = 1500

const formatMoney = (value: number) => new Intl.NumberFormat().format(value)

const random_rgba = () =>
  'rgba(' +
  Math.round(Math.random() * 255) +
  ',' +
  Math.round(Math.random() * 255) +
  ',' +
  Math.round(Math.random() * 255) +
  ',' +
  1 +
  ')'

const FinanceApp: React.FC<{ summary?: boolean }> = ({ summary = false }) => {
  const [current, send] = useMachine(fetchMachine)
  const [apiResult, setApiResult] = React.useState<Portfolio>(null)
  const [displayedPortfolio, setDisplayPortfolio] = React.useState<
    PortfolioItem[]
  >(null)
  const [stockToPurchase, setStockToPurchase] = React.useState<StockToBuy[]>(
    JSON.parse(localStorage.getItem('stockToPurchase') || '[]') as StockToBuy[]
  )
  const [availableFunds, setAvailableFunds] = React.useState(AVAILABLE_FUNDS)
  const [uniqueTypes, setUniqueTypes] = React.useState({})

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/portfolio`, {
        credentials: 'include',
        headers: {
          Authorization: localStorage.getItem('SESSION_ID') || '',
        },
      })

      if (res.ok) {
        const resultJSON: Portfolio = await res.json()

        setApiResult(resultJSON)
        setDisplayPortfolio(resultJSON.portfolioItems)

        const percentagesByType = resultJSON.portfolioItems.reduce(
          (acc, curr) => {
            if (acc[curr.productType]) {
              acc[curr.productType] += curr.totalPositionValue
            } else {
              acc[curr.productType] = curr.totalPositionValue
            }

            return acc
          },
          {} as any
        )

        setUniqueTypes(percentagesByType)
        send('SUCCESS')
      } else {
        if (res.status === 401) {
          console.log('Need to login again')
          send('ERROR_LOGIN')
        }
      }
    } catch (e) {
      console.error(e)
      send('ERROR')
    }
  }

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
        localStorage.setItem('SESSION_ID', json.id)
        fetchData()
      } else {
        console.log('Response was not valid...')
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    const total = stockToPurchase.reduce(
      (acc, curr) => acc + curr.currentStockValue * curr.totalStockToBuy,
      0
    )
    setAvailableFunds(+(AVAILABLE_FUNDS - total).toFixed(2))
    localStorage.setItem('stockToPurchase', JSON.stringify(stockToPurchase))
  }, [stockToPurchase])

  const handlePurchaseClick = (line: PortfolioItem) => {
    console.log(line)
    if (!stockToPurchase.find((stock) => stock.id === line.id)) {
      setStockToPurchase([
        ...stockToPurchase,
        {
          id: line.id,
          name: line.name,
          currentStockValue: line.currentStockValue,
          breakEvenPrice: line.stockValueBreakEvenPrice,
          totalStockToBuy: 1,
        },
      ])
    }
  }

  const handlePortfolioSearch = (e) => {
    const filteredPortfolioData = apiResult.portfolioItems.filter(
      (item) =>
        item.tickerSymbol.includes(e.target.value) ||
        item.name.includes(e.target.value)
    )
    setDisplayPortfolio(filteredPortfolioData)
  }

  const handleDeleteClick = (id: string) => {
    const newStocks = stockToPurchase.filter((stock) => stock.id !== id)
    setStockToPurchase(newStocks)
  }

  const handleItemUpdate = (id: string, totalStockToBuy: number) => {
    const stockCopy = [...stockToPurchase]
    const itemToUpdate = stockToPurchase.findIndex((stock) => stock.id === id)
    stockCopy[itemToUpdate].totalStockToBuy = totalStockToBuy

    setStockToPurchase(stockCopy)
  }

  return (
    <>
      {console.log(current)}
      {current.matches('idle') && (
        <>
          <div className="summary-panels">
            <InvestTotals value={formatMoney(apiResult.overallTotalInEuro)} />
            <InvestTotals
              title="Total + / -"
              value={formatMoney(
                apiResult.overallTotalInEuro - apiResult.overBETotalInEuro
              )}
            />
            <InvestmentsByTypeChart types={uniqueTypes} />
          </div>
          {!summary && (
            <>
              <InvestmentsChart portfolioItems={apiResult.portfolioItems} />

              <InvestmentTable
                portfolioItems={displayedPortfolio}
                onPurchaseClick={handlePurchaseClick}
                searchPortfolio={handlePortfolioSearch}
              />
              {stockToPurchase.length > 0 && (
                <BuyTable
                  portfolioData={stockToPurchase}
                  onDeleteClick={handleDeleteClick}
                  onItemUpdate={handleItemUpdate}
                  availableFunds={availableFunds}
                />
              )}
            </>
          )}
        </>
      )}

      {current.matches('loading') && <SkeltonTile />}

      {current.matches('error') && <h1>An unexpected error occurred...</h1>}

      {current.matches('showLogin') && <Login onSubmit={handleLogin} />}
    </>
  )
}

const InvestmentsChart: React.FC<{ portfolioItems: PortfolioItem[] }> = ({
  portfolioItems,
}) => {
  const [colors] = React.useState(portfolioItems.map(random_rgba))
  const [currentWindowSize, setCurrentWindowSize] = React.useState(
    window.innerWidth
  )

  React.useEffect(() => {
    const updateResizeValue = () => setCurrentWindowSize(window.innerWidth)
    window.addEventListener('resize', updateResizeValue)
    return () => {
      window.removeEventListener('resize', updateResizeValue)
    }
  }, [currentWindowSize])

  return (
    <Tile title="Investments by Product" className="InvestmentsChart">
      <Doughnut
        data={{
          datasets: [
            {
              data: portfolioItems.map((item) => item.totalPositionValue),
              backgroundColor: colors,
            },
          ],
          labels: portfolioItems.map((item) => item.name),
        }}
        options={{
          cutoutPercentage: 75,
          legend: {
            display: currentWindowSize > 950,
            position: 'right',
          },
        }}
      />
    </Tile>
  )
}

const InvestmentsByTypeChart: React.FC<{ types: Record<string, number> }> = ({
  types,
}) => (
  <Tile title="Investments by Type">
    <Doughnut
      data={{
        datasets: [
          {
            data: Object.keys(types).map((type) => types[type]),
            backgroundColor: ['yellow', 'green', 'red'],
          },
        ],
        labels: Object.keys(types),
      }}
      options={{
        cutoutPercentage: 75,
        legend: {
          position: 'right',
        },
      }}
    />
  </Tile>
)

export default FinanceApp
