import React, { useEffect } from "react";
import { useOpponentBoard } from "./useOpponentBoard";

const OpponentBoard = React.memo(({ 
  addPenaltyRowCount,
  gameEnd,
  index,
  indexPenaltyAdded,
  initialShape,
  opponentAction,
  opponentBlockUpdateCount,
  opponentNextBlock
 }) => {
  
  const [display, onKeyDown, addPenaltyRows, endGameWithWin] = useOpponentBoard(initialShape, opponentBlockUpdateCount, opponentNextBlock);

  useEffect(() => {
    if (opponentAction !== null) {
      onKeyDown(opponentAction);
    }
  }, [index]);

  useEffect(() => {
    addPenaltyRows(addPenaltyRowCount);
  }, [indexPenaltyAdded]);

  useEffect(() => {
    if (gameEnd === true) {
      endGameWithWin();
    }
  } , [gameEnd]);

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
                      backgroundColor: cell === 0 ? "white" : cell === 1 ? "blue" : cell === 2 ? "gray" : "transparent"
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
