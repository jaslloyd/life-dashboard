import React from "react";
import Navbar from "./Navbar";
import FinanceTile from "finance/FinanceTile";
import "./index.css";

const DashboardHome: React.FC = () => (
  <>
    <aside>
      <Navbar />
    </aside>
    <main>
      <FinanceTile summary />
    </main>
  </>
);

export default DashboardHome;
