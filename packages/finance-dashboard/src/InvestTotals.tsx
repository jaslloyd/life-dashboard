import React from "react";
import Tile from "./Tile";
import "./InvestTotals.css";

type Currency = "EUR" | "USD";

// TODO: Fix duplication
interface Portfolio {
  usdTotal: number;
  eurTotal: number;
  overallTotalInEuro: number;
  portfolioItems: {
    id: string;
    tickerSymbol: string;
    name: string;
    productType: string;
    sharesHeld: number;
    currentStockValue: number;
    stockValueBreakEvenPrice: number;
    totalPositionValue: number;
    stockCurrency: Currency;
  }[];
}

const InvestTotals: React.FC<{ totals: Portfolio }> = ({ totals }) => (
  <div className="InvestTotals">
    <Tile title="Total" className="overall-total">
      <h5>
        <span>€</span>
        {totals.overallTotalInEuro}
      </h5>
    </Tile>
  </div>
);

export default InvestTotals;
