import React from 'react'
import { Tile, SkeltonTile } from './Tile'
import InvestTotals from './InvestTotals'
import BuyTable from './BuyTable'
import InvestmentTable from './InvestmentTable'
import { Doughnut } from 'react-chartjs-2'
import { Portfolio, PortfolioItem, StockToBuy } from './types'
import { financeDashboard } from './machine/financeAppMachine'
import { useMachine } from '@xstate/react'
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

const FinanceApp: React.FC<{ summary?: boolean }> = ({ summary = false }) => {
  const [{ value, context, matches }, send] = useMachine(financeDashboard)
  const [stockToPurchase, setStockToPurchase] = React.useState<StockToBuy[]>(
    JSON.parse(localStorage.getItem('stockToPurchase') || '[]') as StockToBuy[]
  )
  const [availableFunds, setAvailableFunds] = React.useState(AVAILABLE_FUNDS)

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
    const value = (e.target.value as string).toLowerCase()
    const filteredPortfolioData = context.apiResult.portfolioItems.filter(
      (item) =>
        item.tickerSymbol.toLowerCase().includes(value) ||
        item.name.toLowerCase().includes(value)
    )
    console.log(filteredPortfolioData)
    // setDisplayPortfolio(filteredPortfolioData)
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
      <span className="state">{value}</span>
      {matches('idle') && (
        <>
          <button onClick={console.log}>Refresh</button>
          <div className="summary-panels">
            <InvestTotals
              value={formatMoney(context.apiResult.overallTotalInEuro)}
            />
            <InvestTotals
              title="Total + / -"
              value={formatMoney(
                context.apiResult.overallTotalInEuro -
                  context.apiResult.overBETotalInEuro
              )}
            />
            <InvestmentsByTypeChart types={context.percentagesByType} />
          </div>
          {!summary && (
            <>
              <InvestmentsChart
                portfolioItems={context.apiResult.portfolioItems}
              />

              <InvestmentTable
                portfolioItems={context.apiResult.portfolioItems}
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

      {matches('loading') && <SkeltonTile />}

      {matches('error') && <h1>An unexpected error occurred...</h1>}
    </>
  )
}

export default FinanceApp
