import React, { useEffect } from "react";
import { useBoard } from "./useBoard";

const Board = React.memo(({ 
  addRowCount,
  gameEnd,
  indexRemoved, 
  initialShape, 
  nextBlock,
  blockUpdateCount,
  restartGame
}) => {
  
  const [
    display,
    onKeyDown,
    addRows,
    clearState
  ] = useBoard(
    initialShape,
    nextBlock,
    blockUpdateCount,
    gameEnd
  );

  useEffect(() => {
    // add event listener for keyInput
    const handleKeyDown = (event) => {
      onKeyDown(event);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    addRows(addRowCount);
  }, [indexRemoved]);

  useEffect(() => {
    clearState();
  }, [restartGame]);

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
                      backgroundColor: cell === 0 ? "white" : cell === 1 ? "red" : cell === 2 ? "gray" : "transparent"
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

export default Board;
