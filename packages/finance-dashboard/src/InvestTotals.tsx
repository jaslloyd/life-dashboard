import React from "react";
import { Tile } from "./Tile";
import "./InvestTotals.css";

const InvestTotals: React.FC<{ title?: string; value: number }> = ({
  title = "Total",
  value,
}) => (
  <div className="InvestTotals">
    <Tile title={title} className="overall-total">
      <h5>
        <span>€</span>
        {value}
      </h5>
    </Tile>
  </div>
);

export default InvestTotals;
