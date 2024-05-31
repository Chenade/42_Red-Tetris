import { shapes, shapeIndex } from "../configs/shapes";
import Board from './Board';
import OpponentBoard from './OpponentBoard';
import React, { useState, useEffect } from 'react';
import socket from '../index';

const Game = ({ room, playerName }) => {

    const [ addRowCount,        setAddRowCount        ] = useState(0);
    const [ index,              setIndex              ] = useState(0);
    const [ indexRemoved,       setIndexRemoved       ] = useState(0);
    const [ initialShape,       setInitialShape       ] = useState([]);
    const [ opponentAction,     setOpponentAction     ] = useState(null);
    const [ showBoard,          setShowBoard          ] = useState(false);

    // start the game
    const handleStart = () => {
        socket.emit('start', (response) => {
            console.log('emit start and received response', response);
        });
    };

    useEffect(() => {
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
            } else if (message.event === 'op_action') {
                if (message.data.player !== playerName) {
                    const action = message.data.data.data;

                    if (action === 'removeRows') {
                        setAddRowCount(message.data.data.value);
                        setIndexRemoved(prevIndexRemoved => {
                            return prevIndexRemoved + 1;
                        });

                    } else {
                        setOpponentAction(action);
                        setIndex(prevIndex => {
                            return prevIndex + 1;
                        });
                    }
                }
            }
        };

        // add listeners for start and message events
        socket.on('message', handleMessageEvent);

        // Cleanup the listeners when the component unmounts
        return () => {
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
                            <p>My Board</p>
                            <Board
                                addRowCount={addRowCount}
                                indexRemoved={indexRemoved}
                                initialShape={initialShape}
                            />
                        </div>
                        <div style={{ margin: '50px' }}>
                            <p>Opponent's Board</p>
                            <OpponentBoard 
                                index={index}
                                initialShape={initialShape} 
                                opponentAction={opponentAction} 
                            />
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
