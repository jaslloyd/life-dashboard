import React from "react";
import DashboardShell from "dashboardshell/DashboardShell";
import FinanceApp from "./FinanceApp";
import "./index.css";

const App: React.FC = () => {
  return (
    <DashboardShell>
      <h1>Finance Application</h1>
      <FinanceApp />
    </DashboardShell>
  );
};

export default App;
