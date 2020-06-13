import React from "react";
import "./Tile.css";

const Tile: React.FC<{ title: string }> = ({ title, children }) => (
  <div className="Tile">
    <h4>{title}</h4>
    {children}
  </div>
);

export default Tile;
