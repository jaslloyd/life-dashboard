import React from 'react'
import { Tile, SkeltonTile } from './Tile'
import InvestTotals from './InvestTotals'
import BuyTable from './BuyTable'
import InvestmentTable from './InvestmentTable'
import { Doughnut } from 'react-chartjs-2'
import { PortfolioItem, StockToBuy } from './types'
import { financeDashboard, investmentTable } from './machine/financeAppMachine'
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
  const [currentTable, sendTable] = useMachine(investmentTable, {
    context: {
      stockToPurchase: JSON.parse(
        localStorage.getItem('stockToPurchase') || '[]'
      ) as StockToBuy[],
    },
  })

  const handlePurchaseClick = (line: PortfolioItem) => {
    if (
      !currentTable.context.stockToPurchase.find(
        (stock) => stock.id === line.id
      )
    ) {
      sendTable('ADD', {
        value: {
          id: line.id,
          name: line.name,
          currentStockValue: line.currentStockValue,
          breakEvenPrice: line.stockValueBreakEvenPrice,
          totalStockToBuy: 1,
        },
      })
    }
  }

  const handleItemUpdate = (id: string, totalStockToBuy: number) => {
    sendTable('UPDATE', {
      value: {
        id,
        totalStockToBuy,
      },
    })
  }

  return (
    <>
      <span className="state">
        Dashboard Machine: {JSON.stringify(value)} - {context.lastTimeUpdate}
      </span>
      <span className="state" style={{ marginTop: '50px' }}>
        Table Machine: {JSON.stringify(currentTable.value)}
      </span>
      {matches('idle') && (
        <>
          <button onClick={() => send('FETCH')}>Refresh</button>
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
                portfolioItems={context.portfolioItems}
                onPurchaseClick={handlePurchaseClick}
                searchPortfolio={(e) =>
                  send('FILTER', {
                    value: (e.target.value as string).toLowerCase(),
                  })
                }
              />
              {currentTable.context.stockToPurchase.length > 0 && (
                <BuyTable
                  portfolioData={currentTable.context.stockToPurchase}
                  onDeleteClick={(id) => sendTable('DELETE', { value: id })}
                  onItemUpdate={handleItemUpdate}
                  availableFunds={
                    +(
                      AVAILABLE_FUNDS - currentTable.context.totalPurchasePrice
                    ).toFixed(2)
                  }
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
