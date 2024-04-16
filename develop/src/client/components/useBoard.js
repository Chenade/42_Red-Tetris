import { useState, useEffect } from "react";
import { shapes } from "../configs/shapes";
import { useInterval } from "../actions/useInterval";

const ROW_COUNT = 20;
const COLUMN_COUNT = 10;
const TICK_INTERVAL = 500;

export function useBoard() {
  // scene: background
  const [scene, setScene] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  // shape: current block
  const [shape, setShape] = useState(shapes.O);
  // position: current block position
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // display: scene + shape
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
          // when block is out of stage or touch with other block
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
    const newPosition = { x: x + position.x, y: y + position.y };

    if (!validMove(newPosition, shape)) {
      return false;
    }
    // only when move is valid, change the position of block
    setPosition(newPosition);
    console.log("newPosition", newPosition);

    return true;
  }

  function touchGround() {
    // keep the block in the scene
    setScene(mergeIntoStage(scene, shape, position));
    // drop new block
    setShape(shapes.I);
    setPosition({ x: 0, y: 0 });
  }

  function tick() {
    // when drop to the bottom
    if (!moveBlock(0, 1)) {
      touchGround();
    }
  }

  useInterval(() => {
    // every 500ms, drop the block
    tick();
  }, TICK_INTERVAL);

  function onKeyDown(event) {
    console.log("onKeyDown", event.key);
    switch (event.key) {
      case "ArrowRight":
        moveBlock(1, 0);
        event.preventDefault();
        break;
      case "ArrowLeft":
        moveBlock(-1, 0);
        event.preventDefault();
        break;
      //case "ArrowDown":
      //  moveBlock(0, 1);
      //  event.preventDefault();
      //  break;
      //case "ArrowUp":
      //  rotateShape();
      //  event.preventDefault();
      //  break;
      default:
        break;
    }
  }

  return [display, onKeyDown];
}
