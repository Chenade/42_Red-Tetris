import { connect } from "react-redux";
import { EmptyCell } from "../types";
import Board from "../components/Board";
import React from "react";

const board = Array.from(
  {
    length: 20,
  },
  () => Array.from({ length: 10 }, () => EmptyCell.Empty)
);

const App = () => {
  return (
    <div className="App">
      <h1>Tetris</h1>
      <Board currentBoard={board} />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    message: state.message,
  };
};

export default connect(mapStateToProps, null)(App);
