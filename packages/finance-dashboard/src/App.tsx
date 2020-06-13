import React from "react";
import DashboardShell from "dashboardshell/DashboardShell";
import Tile from "./Tile";
import "./index.css";

type Currency = "EUR" | "USD";

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

const FinanceApp: React.FC = () => {
  // TODO: Move all the api calls to Finance app, like Container Presentation component pattern
  const [apiResult, setApiResult] = React.useState(null);
  const [status, setStatus] = React.useState("loading");

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
      const resp = await fetch(`http://localhost:3000/api/v1/login/${code}`);

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

  return (
    <DashboardShell>
      <h1>Finance Application</h1>
      {status === "idle" && (
        <>
          <InvestTotals totals={apiResult} />
          <InvestmentTable portfolioData={apiResult} />
        </>
      )}

      {status === "error" && <h1>An unexpected error occurred...</h1>}

      {status === "showLogin" && <Login onSubmit={handleLogin} />}
    </DashboardShell>
  );
};

const Login: React.FC<{ onSubmit: (code: string) => void }> = ({
  onSubmit,
}) => {
  const [code, setCode] = React.useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(e);
    onSubmit(code);
  };
  return (
    <Tile title="Login">
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="code" hidden>
          Code
        </label>
        <input
          type="password"
          id="code"
          onChange={(e) => setCode(e.target.value)}
          value={code}
          placeholder="Login Code"
        />
        <button type="submit">Login</button>
      </form>
    </Tile>
  );
};

const InvestmentTable: React.FC<{ portfolioData: Portfolio }> = ({
  portfolioData,
}) => {
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Tile>
  );
};

const InvestTotals: React.FC<{ totals: Portfolio }> = ({ totals }) => (
  <div className="InvestTotals">
    <Tile title="Total" className="overall-total">
      <div className="container">
        <h5>
          <span>€</span>
          {totals.overallTotalInEuro}
        </h5>
      </div>
    </Tile>
  </div>
);
export default FinanceApp;
