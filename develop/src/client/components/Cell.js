import PropTypes from "prop-types";
import React     from "react";

function Cell({ type }) {
  return (
    <div
      className={`cell ${type}`}
      style={{
        height: "30px",
        width: "30px",
        aspectRatio: 1,
        border: "1px solid black",
      }}
    />
  );
}

Cell.propTypes = {
  type: PropTypes.string,
};

export default Cell;
