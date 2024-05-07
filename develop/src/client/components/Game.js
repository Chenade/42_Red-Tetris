import React from 'react';
import Board from './Board';

const Game = ({room, playerName}) => {

    return (
        <div>
            <h1>Welcome to the Game</h1>
            <p>Room: {room}</p>
            <p>Player: {playerName}</p>
            <div>
                <Board />
            </div>
        </div>
    );
};

export default Game;