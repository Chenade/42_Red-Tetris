import React, { useState } from "react";
import { useBoard } from "./useBoard";

const Board = () => {
  const { display } = useBoard();
  console.log(display);
  return (
    <div>
      {display && display.length > 0 &&
        display.map((row, rowIndex) => {
          return (
            <div key={`row-${rowIndex}`} style={{ display: 'flex' }}>
              {row.map((cell, cellIndex) => {
                return (
                  <div 
                    key={`${cellIndex}-${rowIndex}`} 
                    style={{ width: '20px', height: '20px', border: '1px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};

export default Board;
