import React from 'react'
import { Tile } from './Tile'
import { PortfolioItem } from './types'

const InvestmentTable: React.FC<{
  portfolioItems: PortfolioItem[]
  onPurchaseClick: (item: PortfolioItem) => void
  searchPortfolio: (e: any) => void
}> = ({ portfolioItems, onPurchaseClick, searchPortfolio }) => {
  return (
    <Tile title="Investment Portfolio" className="InvestmentTable">
      <input
        type="text"
        placeholder="Enter Ticker or Name"
        onChange={searchPortfolio}
      />
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th>Product Type</th>
            <th># Shares Held</th>
            <th>Current Stock Value</th>
            <th>Break Event Point</th>
            <th>Total Position Value</th>
            <th>Purchase?</th>
          </tr>
        </thead>
        <tbody>
          {portfolioItems.map(
            ({
              id,
              tickerSymbol,
              name,
              productType,
              sharesHeld,
              currentStockValue,
              stockValueBreakEvenPrice,
              totalBreakEvenPrice,
              totalPositionValue,
              stockCurrency,
            }) => (
              <tr key={id}>
                <td>{tickerSymbol}</td>
                <td>{name}</td>
                <td>{productType}</td>
                <td>{sharesHeld}</td>
                <td>{currentStockValue}</td>
                <td>{stockValueBreakEvenPrice}</td>
                <td
                  className={
                    totalBreakEvenPrice > totalPositionValue
                      ? 'negative'
                      : 'positive'
                  }
                >
                  {stockCurrency === 'USD' ? '$' : '€'}
                  {totalPositionValue} ({totalBreakEvenPrice})
                  {totalBreakEvenPrice > totalPositionValue ? (
                    <span>-</span>
                  ) : (
                    <span>+</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={(_) =>
                      onPurchaseClick({
                        id,
                        tickerSymbol,
                        name,
                        productType,
                        sharesHeld,
                        currentStockValue,
                        stockValueBreakEvenPrice,
                        totalBreakEvenPrice,
                        totalPositionValue,
                        stockCurrency,
                      })
                    }
                  >
                    +
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </Tile>
  )
}

export default InvestmentTable
