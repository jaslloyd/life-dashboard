import React from "react";
import DashboardShell from "dashboardshell/DashboardShell";

type Currency = "EUR" | "USD";

interface Portfolio {
  id: string;
  tickerSymbol: string;
  name: string;
  productType: string;
  sharesHeld: number;
  currentStockValue: number;
  stockValueBreakEvenPrice: number;
  totalPositionValue: number;
  stockCurrency: Currency;
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
        console.log(json);
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
      {status === "idle" && <InvestmentTable portfolioData={apiResult} />}

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
    <form onSubmit={handleFormSubmit}>
      <label htmlFor="code">Code</label>
      <input
        type="text"
        id="code"
        onChange={(e) => setCode(e.target.value)}
        value={code}
      />
    </form>
  );
};

const InvestmentTable: React.FC<{ portfolioData: Portfolio }> = ({
  portfolioData,
}) => {
  return (
    <table>
      <thead>
        <tr>
          <td>One</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Damn</td>
        </tr>
      </tbody>
    </table>
  );
};
export default FinanceApp;
