import { useState, useEffect } from "react";
import { shapes } from "../configs/shapes";
import { useInterval } from "../actions/useInterval";
import { store } from '../index';
import { sendMessage } from '../actions/alert';


const ROW_COUNT = 20;
const COLUMN_COUNT = 10;
const TICK_INTERVAL = 500;

let eventData = {
  event: 'action',
  info: {
    data: '',
    value: ''
  }
};

export function useBoard(initialShape) {
  // scene: background
  const [scene, setScene] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  // shape: current block
  const [shape, setShape] = useState(initialShape);
  // position: current block position
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // display: scene + shape
  const [display, setDisplay] = useState(
    Array.from({ length: ROW_COUNT }, () => Array(COLUMN_COUNT).fill(0))
  );
  // game over
  const [gameover, setGameover] = useState(false);

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

  function removeRows() {
    // Remove any completed rows
    let newScene = scene.filter((row) => row.some((cell) => cell === 0 || cell === 2));

    // Add new rows at the top
    const rowsRemoved = ROW_COUNT - newScene.length;
    for (let i = 0; i < rowsRemoved; i++) {
      newScene.unshift(Array(COLUMN_COUNT).fill(0));
    }

    // Update scene
    if (rowsRemoved > 0) {
      setScene(newScene); // newScene is a JavaScript array, not JSON
      eventData.info.data = 'removeRows';
      eventData.info.value = rowsRemoved;
      store.dispatch(sendMessage(store.getState().socket, JSON.stringify(eventData)));
    }
  }

  // check if any row is completed
  useEffect(removeRows, [scene]);

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
    return true;
  }

  function endGame() {
    // if the block is at the top of the stage
    if (position.y === 0) {
      return true;
    }
    return false;
  }

  function touchGround() {
    // keep the block in the scene
    setScene(mergeIntoStage(scene, shape, position));
    if (endGame()) {
      store.dispatch(sendMessage(store.getState().socket, JSON.stringify({ event: 'action', info: { data: 'gameover' } })));
      setGameover(true);
      return;
    }
    // drop new block
    setShape(shapes.J);
    setPosition({ x: 0, y: 0 });
  }

  function tick() {
    // when drop to the bottom
    if (!moveBlock(0, 1)) {
      touchGround();
    }
  }

  useInterval(() => {
    if (!gameover) {
      // every TICK_INTERVAL ms, drop the block
      tick();
    }
  }, TICK_INTERVAL);

  // rotate block
  function rotateShape() {
    const rotatedShape = shape[0].map((col, i) => shape.map((row) => row[i]));
    rotatedShape.forEach((row) => row.reverse());

    // if new shape is valid, update the shape
    if (validMove(position, rotatedShape)) {
      setShape(rotatedShape);
    }
  }

  function onKeyDown(event) {

    switch (event.key) {
      case "ArrowRight":
        moveBlock(1, 0);
        eventData.info.data = 'ArrowRight';
        eventData.info.value = 0;
        store.dispatch(sendMessage(store.getState().socket, JSON.stringify(eventData)));
        event.preventDefault();
        break;
      case "ArrowLeft":
        moveBlock(-1, 0);
        eventData.info.data = 'ArrowLeft';
        eventData.info.value = 1;
        store.dispatch(sendMessage(store.getState().socket, JSON.stringify(eventData)));
        event.preventDefault();
        break;
      case "ArrowDown":
        moveBlock(0, 1);
        eventData.info.data = 'ArrowDown';
        eventData.info.value = 2;
        store.dispatch(sendMessage(store.getState().socket, JSON.stringify(eventData)));
        event.preventDefault();
        break;
      case "ArrowUp":
        rotateShape();
        eventData.info.data = 'ArrowUp';
        eventData.info.value = 3;
        store.dispatch(sendMessage(store.getState().socket, JSON.stringify(eventData)));
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  function addRows(addRowCount) {
    if (addRowCount > 0) {
      
      addRowCount *= 2;

      store.dispatch(sendMessage(store.getState().socket, JSON.stringify({ event: 'action', info: { data: 'addPenaltyRows', value: addRowCount } })));

      // Create a deep copy of the scene array
      let newScene = JSON.parse(JSON.stringify(scene));

      // Add new rows at the bottom
      for (let i = 0; i < addRowCount; i++) {
        newScene.push(Array(COLUMN_COUNT).fill(2));
      }

      // Create a new array with the same dimensions as the board
      let nextScene = Array.from({ length: ROW_COUNT }, (_, index) => {
        if (index < ROW_COUNT - addRowCount) {
          return newScene[index + addRowCount];
        } else {
          return Array(COLUMN_COUNT).fill(2);
        }
      });
      setScene(nextScene);
    }
  }

  function endGameWithWin() {
    setGameover(true);
  }

  return [display, onKeyDown, addRows, endGame, endGameWithWin];
}
