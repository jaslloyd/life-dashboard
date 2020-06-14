import React from "react";
import "./Tile.css";

const Tile: React.FC<{ title: string; className?: string }> = ({
  title,
  className = "",
  children,
}) => (
  <div className={`Tile ${className}`}>
    <h4>{title}</h4>
    {children}
  </div>
);

const SkeltonTile: React.FC = () => <div className="Skeleton" />;

export { Tile, SkeltonTile };
