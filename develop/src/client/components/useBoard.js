import React, { useState, useEffect } from "react";
import { shapes } from "../configs/shapes";

function mergeIntoStage(scene) {
  return scene;
}

export function useBoard() {
  const [scene, setScene] = useState(
    Array.from({ length: 20 }, () => Array(10).fill(0))
  );
  const [shape, setShape] = useState(shapes.I);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState(
    Array.from({ length: 20 }, () => Array(10).fill(0))
  );

  function mergeIntoStage(scene, shape, position) {
    const { x, y } = position;
    shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          scene[y + i][x + j] = cell;
        }
      });
    });
    return scene;
  }

  function updateDisplay() {
    const newDisplay = mergeIntoStage(scene, shape, position);
    setDisplay(newDisplay);
  }

  useEffect(updateDisplay, [scene, shape, position]);

  return { display };
}
