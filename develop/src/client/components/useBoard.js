import React, { useState, useEffect } from "react";

function mergeIntoStage(scene) {
  return scene;
}

export function useBoard() {
  const [scene, setScene] = useState(
    Array.from({ length: 20 }, () => Array(10).fill(0))
  );
  const [display, setDisplay] = useState(
    Array.from({ length: 20 }, () => Array(10).fill(0))
  );

  function updateDisplay() {
    const newDisplay = mergeIntoStage(scene);
    setDisplay(newDisplay);
  }

  useEffect(updateDisplay, [scene, display]);

  return { display };
}
