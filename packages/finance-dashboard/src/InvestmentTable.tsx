import React from "react";
import { Tile } from "./Tile";
import { Portfolio, PortfolioItem } from "./types";

const InvestmentTable: React.FC<{
  portfolioData: Portfolio;
  onPurchaseClick: (item: PortfolioItem) => void;
}> = ({ portfolioData, onPurchaseClick }) => {
  return (
    <Tile title="Investment Portfolio" className="InvestmentTable">
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
          {portfolioData.portfolioItems.map((lineItem) => (
            <tr key={lineItem.id}>
              <td>{lineItem.tickerSymbol}</td>
              <td>{lineItem.name}</td>
              <td>{lineItem.productType}</td>
              <td>{lineItem.sharesHeld}</td>
              <td>{lineItem.currentStockValue}</td>
              <td>{lineItem.stockValueBreakEvenPrice}</td>
              <td
                className={
                  lineItem.totalBreakEvenPrice > lineItem.totalPositionValue
                    ? "negative"
                    : "positive"
                }
              >
                {lineItem.stockCurrency === "USD" ? "$" : "€"}
                {lineItem.totalPositionValue} ({lineItem.totalBreakEvenPrice})
                {lineItem.totalBreakEvenPrice > lineItem.totalPositionValue ? (
                  <span>-</span>
                ) : (
                  <span>+</span>
                )}
              </td>
              <td>
                <button onClick={(_) => onPurchaseClick(lineItem)}>+</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Tile>
  );
};

export default InvestmentTable;
