import React from "react";
import type { AllowedColors } from "./Tile";
import "./styles.css"
import { Tile } from "./Tile";

const rows = 7;
const cols = 20;

const allowedColors: AllowedColors[] = ["RED", "YELLOW", "GREEN", "BLUE"];

function getRandomColor(): AllowedColors {
    const index = Math.floor(Math.random() * allowedColors.length);
    return allowedColors[index];
}



export default function Board(){
    const allowed_colors: AllowedColors[] = [];

    for (let i = 0; i< rows*cols; i++){

        allowed_colors.push( getRandomColor())
    }

    return(
        <div className={"board"} style={{gridTemplateColumns: `repeat(${cols}, 48px)`}}>
            {allowed_colors.map((color, idx) => (
                <Tile color={color} key={idx}/>
            ))}
        </div>
    );
}