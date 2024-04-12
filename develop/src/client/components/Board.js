import Cell      from "./Cell";
import PropTypes from "prop-types";
import React     from "react";

const Board = ({ currentBoard }) => {
  return (
    <div
      className="board"
      style={{
        border: "2px solid black",
        userSelect: "none",
        margin: "auto",
        gridArea: "game",
        width: "fit-content",
      }}
    >
      {currentBoard.map((row, rowIndex) => (
        <div className="row" key={rowIndex} style={{ display: "flex" }}>
          {row.map((cell, cellIndex) => (
            <Cell key={cellIndex} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

Board.propTypes = {
  currentBoard: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

export default Board;
