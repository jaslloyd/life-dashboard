import React from "react";
import { Tile } from "./Tile";
import { StockToBuy } from "./types";

const BuyTable: React.FC<{
  portfolioData: StockToBuy[];
  onDeleteClick: (id: string) => void;
  onItemUpdate: (id: string, totalStockToBuy: number) => void;
  availableFunds: number;
}> = ({ portfolioData, onDeleteClick, onItemUpdate, availableFunds }) => (
  <Tile
    title={`Buy Table - Available Funds ${availableFunds}`}
    className="BuyTable"
  >
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price per Share</th>
          <th># of Shares</th>
          <th>Total</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {portfolioData.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.currentStockValue}</td>
            <td>
              <input
                type="number"
                name="counter"
                min="1"
                value={item.totalStockToBuy}
                onChange={(e) => onItemUpdate(item.id, +e.target.value)}
              />
            </td>
            <td>
              {(item.totalStockToBuy * item.currentStockValue).toFixed(2)}
            </td>
            <td>
              <button onClick={(_) => onDeleteClick(item.id)}>X</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Tile>
);

export default BuyTable;
