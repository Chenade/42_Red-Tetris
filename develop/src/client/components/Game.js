import React, { useState } from 'react';
import Board from './Board';

const Game = ({ room, playerName }) => {
    // State to control the visibility of the Board
    const [showBoard, setShowBoard] = useState(false);

    // Function to handle the Start button click
    const handleStart = () => {
        setShowBoard(true);
    };

    return (
        <div>
            <h1>Red Tetris</h1>
            <p>Room: {room}</p>
            <p>Player: {playerName}</p>
            {!showBoard ? (
                <button onClick={handleStart} style={{ margin: '10px' }}>
                    Start Game
                </button>
            ) : (
                <div>
                    <Board />
                </div>
            )}
        </div>
    );
};

export default Game;