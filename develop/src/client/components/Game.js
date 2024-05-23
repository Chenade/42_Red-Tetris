import { shapes, shapeIndex } from "../configs/shapes";
import Board from './Board';
import OpponentBoard from './OpponentBoard';
import React, { useState, useEffect } from 'react';
import socket from '../index';

const Game = ({ room, playerName }) => {

    const [ showBoard,          setShowBoard          ] = useState(false);
    const [ initialShape,       setInitialShape       ] = useState([]);
    const [ opponentPlayerName, setOpponentPlayerName ] = useState('');

    // start the game
    const handleStart = () => {
        socket.emit('start', (response) => {
            console.log('emit start and received response', response);
        });
    };

    useEffect(() => {

        // receive start event and show the board
        const handleStartEvent = (data) => {
            console.log('received start event', data);
            if (data == 'player1') {
                setOpponentPlayerName('player2');
            } else {
                setOpponentPlayerName('player1');
            }
        };
    
        // receive initial block shape
        const handleMessageEvent = (message) => {
            console.log('received message', message);
            if (message.event === 'newPuzzle') {
                const init = message.data.type;
                if (0 <= init && init < 7) {
                    console.log('set this shape as initialShape: ', shapeIndex[init]);
                    setInitialShape(shapes[shapeIndex[init]]);
                } else {
                    console.log('Received shape index is invalid:', init);
                }
            }
        };
    
        // add listeners for start and message events
        socket.on('start', handleStartEvent);
        socket.on('message', handleMessageEvent);
    
        // Cleanup the listeners when the component unmounts
        return () => {
            socket.off('start', handleStartEvent);
            socket.off('message', handleMessageEvent);
        };
    }, []);

    // when initialShape is set, show the board
    useEffect(() => {
        if (initialShape && initialShape.length)
            setShowBoard(true);
    }, [initialShape]);

    return (
        <div>
            <h1>Red Tetris</h1>
            <p>Room: {room}</p>
            {
                showBoard ? 
                (
                    <div style={{ display: 'flex'}}>
                        <div style={{ margin: '50px' }}>
                            <p>Player: {playerName}</p>
                            <Board initialShape={initialShape} />
                        </div>
                        <div style={{ margin: '50px' }}>
                            <p>Player: {opponentPlayerName}</p>
                            <OpponentBoard initialShape={initialShape} />
                        </div>
                    </div>
                ) : (
                    <button onClick={handleStart} style={{ margin: '10px' }}>
                        Start Game
                    </button>
                )
            }
        </div>
    );
};

export default Game;
