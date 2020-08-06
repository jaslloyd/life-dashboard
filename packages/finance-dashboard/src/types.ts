type Currency = 'EUR' | 'USD'

export interface Portfolio {
  overallTotalInEuro: number
  overBETotalInEuro: number
  portfolioItems: PortfolioItem[]
}

export interface PortfolioItem {
  id: string
  tickerSymbol: string
  name: string
  productType: string
  sharesHeld: number
  currentStockValue: number
  stockValueBreakEvenPrice: number
  totalPositionValue: number
  stockCurrency: Currency
  totalBreakEvenPrice: number
}

export interface StockToBuy {
  id: string
  name: string
  currentStockValue: number
  totalStockToBuy: number
}
