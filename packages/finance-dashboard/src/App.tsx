import React from "react";
import DashboardShell from "dashboardshell/DashboardShell";

const FinanceApp: React.FC = () => (
  <DashboardShell>
    <h1>Finance Application</h1>
    <InvestmentTable />
  </DashboardShell>
);

const InvestmentTable: React.FC = () => {
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
        console.log("Shittt..");
        setStatus("error");
      }
    };
    fetchData();
  }, []);
  return status === "idle" ? (
    <table>
      <thead>
        <tr>
          <td>One - {status}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Damn</td>
        </tr>
      </tbody>
    </table>
  ) : (
    <>Status: {status}</>
  );
};
export default FinanceApp;
