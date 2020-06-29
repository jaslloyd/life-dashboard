import React from "react";
import { Tile, SkeltonTile } from "./Tile";
import Login from "./Login";
import InvestTotals from "./InvestTotals";
import BuyTable from "./BuyTable";
import InvestmentTable from "./InvestmentTable";
import { Doughnut } from "react-chartjs-2";
import { Portfolio, PortfolioItem, StockToBuy } from "./types";

const AVAILABLE_FUNDS = 1700;

const formatMoney = (value: number) => new Intl.NumberFormat().format(value);

function random_rgba() {
  var o = Math.round,
    r = Math.random,
    s = 255;
  return (
    "rgba(" +
    o(r() * s) +
    "," +
    o(r() * s) +
    "," +
    o(r() * s) +
    "," +
    r().toFixed(1) +
    ")"
  );
}

const FinanceApp: React.FC<{ summary?: boolean }> = ({ summary = false }) => {
  // TODO: This data is highly related to each other so use a useReducer
  const [status, setStatus] = React.useState("loading");
  const [apiResult, setApiResult] = React.useState<Portfolio>(null);
  const [stockToPurchase, setStockToPurchase] = React.useState<StockToBuy[]>(
    JSON.parse(localStorage.getItem("stockToPurchase")) || []
  );
  const [availableFunds, setAvailableFunds] = React.useState(AVAILABLE_FUNDS);
  const [uniqueTypes, setUniqueTypes] = React.useState({});

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
        const resultJSON: Portfolio = await res.json();

        setApiResult(resultJSON);
        const uniqueTypes = new Array(
          ...new Set(resultJSON.portfolioItems.map((p) => p.productType))
        );

        // const b = [...a].map(cat => resultJSON.portfolioItems.filter(p => p.productType === cat).reduce((acc, curr) => acc[cat] + curr.totalPositionValue, {}));

        const percentagesByType = resultJSON.portfolioItems.reduce(
          (acc, curr) => {
            if (acc[curr.productType]) {
              acc[curr.productType] += curr.totalPositionValue;
            } else {
              acc[curr.productType] = curr.totalPositionValue;
            }

            return acc;
          },
          {}
        );

        setUniqueTypes(percentagesByType);
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
      setStatus("loading");
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

  React.useEffect(() => {
    const total = stockToPurchase.reduce(
      (acc, curr) => acc + curr.currentStockValue * curr.totalStockToBuy,
      0
    );
    setAvailableFunds(AVAILABLE_FUNDS - total);
    localStorage.setItem("stockToPurchase", JSON.stringify(stockToPurchase));
  }, [stockToPurchase]);

  const handlePurchaseClick = (line: PortfolioItem) => {
    if (!stockToPurchase.find((stock) => stock.id === line.id)) {
      setStockToPurchase([
        ...stockToPurchase,
        {
          id: line.id,
          name: line.name,
          currentStockValue: line.currentStockValue,
          totalStockToBuy: 1,
        },
      ]);
    }
  };

  const handleDeleteClick = (id: string) => {
    const newStocks = stockToPurchase.filter((stock) => stock.id !== id);

    setStockToPurchase(newStocks);
  };

  const handleItemUpdate = (id: string, totalStockToBuy: number) => {
    const stockCopy = [...stockToPurchase];
    const itemToUpdate = stockToPurchase.findIndex((stock) => stock.id === id);
    stockCopy[itemToUpdate].totalStockToBuy = totalStockToBuy;

    setStockToPurchase(stockCopy);
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
              <div className="charts">
                <InvestmentsChart portfolioItems={apiResult.portfolioItems} />
                <InvestmentsByTypeChart types={uniqueTypes} />
              </div>

              <InvestmentTable
                portfolioData={apiResult}
                onPurchaseClick={handlePurchaseClick}
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

      {status == "loading" && <SkeltonTile />}

      {status === "error" && <h1>An unexpected error occurred...</h1>}

      {status === "showLogin" && <Login onSubmit={handleLogin} />}
    </>
  );
};

const InvestmentsChart: React.FC<{ portfolioItems: PortfolioItem[] }> = ({
  portfolioItems,
}) => {
  const [colors] = React.useState(portfolioItems.map(random_rgba));
  return (
    <Tile title="Chart">
      <Doughnut
        height={300}
        width={300}
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
          maintainAspectRatio: false,
          cutoutPercentage: 75,
        }}
      />
    </Tile>
  );
};

const InvestmentsByTypeChart: React.FC<{ types: Record<string, number> }> = ({
  types,
}) => (
  <Tile title="Chart">
    <Doughnut
      height={150}
      width={150}
      data={{
        datasets: [
          {
            data: Object.keys(types).map((type) => types[type]),
            backgroundColor: ["yellow", "green", "red"],
          },
        ],
        labels: Object.keys(types),
      }}
      options={{
        maintainAspectRatio: false,
        cutoutPercentage: 75,
      }}
    />
  </Tile>
);

export default FinanceApp;
