import { shapes, shapeIndex } from "../configs/shapes";
import Board from './Board';
import OpponentBoard from './OpponentBoard';
import React, { useState, useEffect } from 'react';
import socket from '../index';
import { store } from '../index';
import { startGame, receiveMessage } from '../actions/alert';

const Game = ({ room, playerName }) => {

    const [ addRowCount,        setAddRowCount        ] = useState(0);
    const [ addPenaltyRowCount, setAddPenaltyRowCount ] = useState(0);
    const [ index,              setIndex              ] = useState(0);
    const [ indexRemoved,       setIndexRemoved       ] = useState(0);
    const [ indexPenaltyAdded,  setIndexPenaltyAdded  ] = useState(0);
    const [ initialShape,       setInitialShape       ] = useState([]);
    const [ opponentAction,     setOpponentAction     ] = useState(null);
    const [ showBoard,          setShowBoard          ] = useState(false);
    const [ message,            setMessage            ] = useState('');
    const [ gameEnd,            setGameEnd            ] = useState(false);
    const [ opponentGameEnd,    setOpponentGameEnd    ] = useState(false);

    const handleStart = () => {
        store.dispatch(startGame(store.getState().socket));
    };

    const handleMessageEvent = (message) => {
        if (message.event === 'newPuzzle') {
            const init = message.data.type;
            if (0 <= init && init < 7) {
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

                } else if (action === 'addPenaltyRows') {
                    setAddPenaltyRowCount(message.data.data.value);
                    setIndexPenaltyAdded(prevIndexPenaltyAdded => {
                        return prevIndexPenaltyAdded + 1;
                    });
                } else if (action === 'gameover') {
                    socket.emit('message', JSON.stringify({ event: 'action', info: { data: 'gameEndWithWin' } }));
                    setMessage(message.data.player + ' is Game Over. You Win!');
                    setGameEnd(true);
                } else if (action === 'gameEndWithWin') {
                    setOpponentGameEnd(true);
                } else {
                    setOpponentAction(action);
                    setIndex(prevIndex => {
                        return prevIndex + 1;
                    });
                }
            } else {
                const action = message.data.data.data;
                if (action === 'gameover') {
                    setMessage('Game Over!!!');
                    setGameEnd(true);
                }
            }
        }
    };

    useEffect(() => {
    
        store.dispatch(receiveMessage(store.getState().socket));
    
        const unsubscribe = store.subscribe(() => {
          if (store.getState().message && store.getState().message.event) {
            handleMessageEvent(store.getState().message);
          }
        });
    
        return () => {
          unsubscribe();
        };
    
      }, []);

    useEffect(() => {
        if (initialShape && initialShape.length)
            setShowBoard(true);
    }, [initialShape]);

    return (
        <div>
            <h1>Red Tetris</h1>
            <p>Room: {room}</p>
            <p>Player: {playerName}</p>
            <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>
            {
                showBoard ? 
                (
                    <div style={{ display: 'flex'}}>
                        <div style={{ margin: '50px' }}>
                            <p>My Board</p>
                            <Board
                                addRowCount={addRowCount}
                                gameEnd={gameEnd}
                                indexRemoved={indexRemoved}
                                initialShape={initialShape}
                            />
                        </div>
                        <div style={{ margin: '50px' }}>
                            <p>Opponent's Board</p>
                            <OpponentBoard 
                                addPenaltyRowCount={addPenaltyRowCount}
                                gameEnd={opponentGameEnd}
                                index={index}
                                indexPenaltyAdded={indexPenaltyAdded}
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
