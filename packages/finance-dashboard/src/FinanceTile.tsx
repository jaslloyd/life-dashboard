import React from "react";
import Login from "./Login";
import InvestTotals from "./InvestTotals";

// TODO: Cleanup Duplication between this and Finance App.
const FinanceTile: React.FC = () => {
  const [apiResult, setApiResult] = React.useState(null);
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    fetchData();
  }, []);

  // TODO: Move this out to a util function
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
    <>
      {status === "idle" && (
        <>
          <InvestTotals totals={apiResult} />
        </>
      )}

      {status == "loading" && <div className="Tile skeleton"></div>}

      {status === "error" && <h1>An unexpected error occurred...</h1>}

      {status === "showLogin" && <Login onSubmit={handleLogin} />}
    </>
  );
};

export default FinanceTile;
