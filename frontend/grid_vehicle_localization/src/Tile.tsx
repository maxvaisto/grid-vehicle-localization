import React from "react";
import "./styles.css"
type AllowedColors = "RED" | "YELLOW" | "GREEN" | "BLUE";

const cssColors: Record<AllowedColors, string> = {
  YELLOW: '#FFFF00',
  RED: '#e74c3c',
  BLUE: '#3498db',
  GREEN: '#2ecc71',
};

function Tile({color}: {color: AllowedColors}) {

    return (
        <div className="Tile"
        style ={{background: cssColors[color]}}>

        </div>
    );
}

export {Tile, AllowedColors};

