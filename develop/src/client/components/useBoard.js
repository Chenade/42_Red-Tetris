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
    const res = stage.slice();
    res[y] = stage[y].slice();
    res[y][x] = 1;
    return res;
  }

  function mergeIntoStage(stage, shape, position) {
    if (!Array.isArray(shape) || shape.length === 0) {
      return stage;
    }
    let newStage = JSON.parse(JSON.stringify(stage));

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const stageX = x + position.x;
          const stageY = y + position.y;

          if (
            stageX >= 0 &&
            stageY >= 0 &&
            stageX < COLUMN_COUNT &&
            stageY < ROW_COUNT
          ) {
            newStage = updateStage(newStage, stageX, stageY);
          }
        }
      }
    }

    return newStage;
  }

  function updateDisplay() {
    setDisplay(mergeIntoStage(scene, shape, position));
  }

  useEffect(updateDisplay, [scene, shape, position]);

  function validMove(position, shape) {
    if (!Array.isArray(shape) || shape.length === 0) {
      return false;
    }
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const stageX = x + position.x;
          const stageY = y + position.y;

          if (
            stageX < 0 ||
            stageX >= COLUMN_COUNT ||
            stageY >= ROW_COUNT ||
            scene[stageY][stageX] !== 0
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function moveBlock(x, y) {
    const res = { x: x + position.x, y: y + position.y };

    if (!validMove(res, shape)) {
      return false;
    }

    setPosition(res);

    return true;
  }

  function touchGround() {
    setScene(mergeIntoStage(scene, shape, position));
    setShape(shapes.I);
    setPosition({ x: 0, y: 0 });
  }

  function tick() {
    if (!moveBlock(0, 1)) {
      touchGround();
    }
  }

  useInterval(() => {
    tick();
  }, 500);

  return { display };
}
