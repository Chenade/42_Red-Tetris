import { useState, useEffect } from "react";
import { shapes } from "../configs/shapes";
import { useInterval } from "../actions/useInterval";

const ROW_COUNT = 20;
const COLUMN_COUNT = 10;

export function useBoard() {
  const [scene, setScene] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  const [shape, setShape] = useState(shapes.O);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );

  function updateStage(stage, x, y) {
    // copy the stage first
    const res = stage.slice();
    res[y] = stage[y].slice();
    // put the block's cell to stage
    res[y][x] = 1;
    return res;
  }

  function mergeIntoStage(stage, shape, position) {
    // calculate the block position in the stage
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          const stageX = x + position.x;
          const stageY = y + position.y;

          // if block cell is inside the stage, update stage
          if (
            stageX >= 0 &&
            stageY >= 0 &&
            stageX < COLUMN_COUNT &&
            stageY < ROW_COUNT
          ) {
            stage = updateStage(stage, stageX, stageY);
          }
        }
      });
    });

    return stage;
  }

  function updateDisplay() {
    console.log("scene", scene);
    console.log("shape", shape);
    console.log("position", position);
    setDisplay(mergeIntoStage(scene, shape, position));
  }

  useEffect(updateDisplay, [scene, shape, position]);

  // drop block
  useInterval(() => {
    setPosition((prevPosition) => ({
      x: prevPosition.x,
      y: prevPosition.y + 1,
    }));
  }, 1000);

  return { display };
}
