import React from "react";
import { Tile, SkeltonTile } from "./Tile";
import Login from "./Login";
import InvestTotals from "./InvestTotals";

type Currency = "EUR" | "USD";

interface Portfolio {
  usdTotal: number;
  eurTotal: number;
  overallTotalInEuro: number;
  portfolioItems: PortfolioItem[];
}

interface PortfolioItem {
  id: string;
  tickerSymbol: string;
  name: string;
  productType: string;
  sharesHeld: number;
  currentStockValue: number;
  stockValueBreakEvenPrice: number;
  totalPositionValue: number;
  stockCurrency: Currency;
  totalBreakEvenPrice: number;
}

const formatMoney = (value: number) => new Intl.NumberFormat().format(value);

const FinanceApp: React.FC<{ summary?: boolean }> = ({ summary = false }) => {
  const [apiResult, setApiResult] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [stockToPurchase, setStockToPurchase] = React.useState<PortfolioItem[]>(
    []
  );

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/portfolio`, {
        credentials: "include",
        headers: {
          Authorization: localStorage.getItem("SESSION_ID"),
        },
      });

      if (res.ok) {
        const resultJSON = await res.json();

        setApiResult(resultJSON);
        setStatus("idle");
      } else {
        if (res.status === 401) {
          console.log("Need to login again");
          setStatus("showLogin");
        }
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const handleLogin = async (code: string) => {
    try {
      setApiResult("loading");
      const resp = await fetch(`http://localhost:3000/api/v1/login`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          code,
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        localStorage.setItem("SESSION_ID", json.id);
        fetchData();
      } else {
        console.log("Response was not valid...");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePurchaseClick = (line) => {
    if (!stockToPurchase.find((stock) => stock.id === line.id)) {
      setStockToPurchase([...stockToPurchase, line]);
    }
  };

  const handleDeleteClick = (id: string) => {
    const newStocks = stockToPurchase.filter((stock) => stock.id !== id);

    setStockToPurchase(newStocks);
  };

  return (
    <>
      {status === "idle" && (
        <>
          <div className="summary-panels">
            <InvestTotals value={formatMoney(apiResult.overallTotalInEuro)} />
            <InvestTotals
              title="Total + / -"
              value={formatMoney(
                apiResult.overallTotalInEuro - apiResult.overBETotalInEuro
              )}
            />
          </div>
          {!summary && (
            <>
              <InvestmentTable
                portfolioData={apiResult}
                onPurchaseClick={handlePurchaseClick}
              />
              {stockToPurchase.length > 0 && (
                <BuyTable
                  portfolioData={stockToPurchase}
                  onDeleteClick={handleDeleteClick}
                />
              )}
            </>
          )}
        </>
      )}

      {status == "loading" && <SkeltonTile />}

      {status === "error" && <h1>An unexpected error occurred...</h1>}

      {status === "showLogin" && <Login onSubmit={handleLogin} />}
    </>
  );
};

const InvestmentTable: React.FC<{
  portfolioData: Portfolio;
  onPurchaseClick: (item: PortfolioItem) => void;
}> = ({ portfolioData, onPurchaseClick }) => {
  return (
    <Tile title="Investment Portfolio">
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
              <td>
                {lineItem.stockCurrency === "USD" ? "$" : "€"}
                {lineItem.totalPositionValue}
                {lineItem.totalBreakEvenPrice > lineItem.totalPositionValue
                  ? "-"
                  : "+"}
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

const BuyTable: React.FC<{
  portfolioData: PortfolioItem[];
  onDeleteClick: (id: string) => void;
}> = ({ portfolioData, onDeleteClick }) => {
  const [availableFunds, setAvailableFunds] = React.useState(1700);

  React.useEffect(() => {}, []);

  const handleItemUpdate = (total) => {
    console.log(total);
  };

  return (
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
          {portfolioData.map((lineItem) => (
            <BuyItemRow
              key={lineItem.id}
              item={lineItem}
              onDeleteClick={onDeleteClick}
              onItemUpdate={handleItemUpdate}
            />
          ))}
        </tbody>
      </table>
    </Tile>
  );
};

// TODO: Check for input type of counter...
const BuyItemRow: React.FC<{
  item: PortfolioItem;
  onDeleteClick: (id: string) => void;
  onItemUpdate: (number: number) => void;
}> = ({ item, onDeleteClick, onItemUpdate }) => {
  const [totalStockToBuy, setTotalStockToBuy] = React.useState(0);
  return (
    <tr>
      <td>{item.name}</td>
      <td>{item.currentStockValue}</td>
      <td>
        <input
          type="number"
          name="counter"
          id="counter2"
          min="1"
          value={totalStockToBuy}
          onChange={(e) => {
            setTotalStockToBuy(+e.target.value);
            onItemUpdate(
              +(totalStockToBuy * item.currentStockValue).toFixed(2)
            );
          }}
        />
      </td>
      <td>{(totalStockToBuy * item.currentStockValue).toFixed(2)}</td>
      <td>
        <button onClick={(_) => onDeleteClick(item.id)}>X</button>
      </td>
    </tr>
  );
};

export default FinanceApp;
