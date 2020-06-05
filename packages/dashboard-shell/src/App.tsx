import React from "react";
import Navbar from "./Navbar";
import "./index.css";

const App: React.FC = () => (
  <>
    <aside>
      <Navbar />
    </aside>
    <main>
      <h1>Hello from React Typescript</h1>
    </main>
  </>
);
export default App;
