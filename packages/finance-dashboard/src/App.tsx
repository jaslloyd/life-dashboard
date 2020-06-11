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
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/portfolio`);

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
    fetchData();
  }, []);

  return (
    <DashboardShell>
      <h1>Finance Application</h1>
      {status === "idle" && <InvestmentTable portfolioData={apiResult} />}

      {status === "error" && <h1>An unexpected error occurred...</h1>}

      {status === "showLogin" && <h1>Show login page here</h1>}
    </DashboardShell>
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
