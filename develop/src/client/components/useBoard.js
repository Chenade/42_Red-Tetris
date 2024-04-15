import { useState, useEffect } from "react";
import { shapes } from "../configs/shapes";
import { useInterval } from "../actions/useInterval";

const ROW_COUNT = 20;
const COLUMN_COUNT = 10;

export function useBoard() {
  const [scene, setScene] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  const [shape, setShape] = useState(shapes.I);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  //  const [display, setDisplay] = useState(() =>
  //    mergeIntoStage(scene, shape, position)
  //  );

  //  function mergeIntoStage(scene, shape, position) {
  //    const { x, y } = position;
  //    shape.forEach((row, i) => {
  //      row.forEach((cell, j) => {
  //        if (cell) {
  //          scene[y + i][x + j] = cell;
  //        }
  //      });
  //    });
  //    return scene;
  //  }

  function mergeIntoStage(stage, shape, position) {
    let res = stage;

    // Iterate over each row of the shape
    shape.forEach((row, y) => {
      // Iterate over each column of the row
      row.forEach((cell, x) => {
        if (cell === 1) {
          // Check if the cell is part of the shape
          const stageX = x + position.x;
          const stageY = y + position.y;

          if (
            stageX >= 0 &&
            stageY >= 0 &&
            stageX < COLUMN_COUNT &&
            stageY < ROW_COUNT
          ) {
            res = updateStage(res, stageX, stageY, 1);
          }
        }
      });
    });

    return res;
  }

  function updateStage(stage, x, y, value) {
    if (stage[y][x] === value) {
      return stage;
    }
    const res = stage.slice();
    res[y] = stage[y].slice();
    res[y][x] = value;
    return res;
  }

  function updateDisplay() {
    console.log("scene", scene);
    console.log("shape", shape);
    console.log("position", position);
    const newDisplay = mergeIntoStage(scene, shape, position);
    setDisplay(newDisplay);
  }

  useEffect(updateDisplay, [scene, shape, position]);
  useInterval(() => {
    setPosition((prevPosition) => ({
      x: prevPosition.x,
      y: prevPosition.y + 1,
    }));
  }, 1000);

  return { display };
}
