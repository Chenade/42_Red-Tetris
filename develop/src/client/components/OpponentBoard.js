import React, { useEffect } from "react";
import { useOpponentBoard } from "./useOpponentBoard";

const OpponentBoard = React.memo(({ initialShape, opponentAction, index }) => {
  
  const [display, onKeyDown] = useOpponentBoard(initialShape);

  useEffect(() => {
    console.log('Opponent action in OpponentBoard:', opponentAction);
    if (opponentAction !== null) {
      if (opponentAction === 'ArrowRight') {
        console.log('Move right');
      } else if (opponentAction === 'ArrowLeft') {
        console.log('Move left');
      } else if (opponentAction === 'ArrowDown') {
        console.log('Move down');
      } else if (opponentAction === 'ArrowUp') {
        console.log('Rotate');
      }
      onKeyDown(opponentAction);
    }
  }, [index]);

  return (
    <div>
      {display &&
        display.length > 0 &&
        display.map((row, rowIndex) => {
          return (
            <div key={`row-${rowIndex}`} style={{ display: "flex" }}>
              {row.map((cell, cellIndex) => {
                return (
                  <div
                    key={`${cellIndex}-${rowIndex}`}
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "1px solid black",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: cell === 0 ? "white" : cell === 1 ? "blue" : "transparent"
                    }}
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
});

export default OpponentBoard;
