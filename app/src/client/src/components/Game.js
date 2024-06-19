import { shapes, shapeIndex } from "../configs/shapes";
import Board from './Board';
import OpponentBoard from './OpponentBoard';
import React, { useState, useEffect } from 'react';
import { store } from '../index';
import { startGame, receiveMessage, gameEndWithWin, startGameSuccess, startGameFailed, opponentJoin, opponentLeft } from '../actions/alert';

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
    const [ errorMessage,       setErrorMessage       ] = useState('');
    const [ gameEnd,            setGameEnd            ] = useState(false);
    const [ opponentGameEnd,    setOpponentGameEnd    ] = useState(false);
    const [ opponentExist,      setOpponentExist      ] = useState(false);
    const [ nextBlock,          setNextBlock          ] = useState(null);
    const [ blockUpdateCount,   setBlockUpdateCount    ] = useState(0);
    const [ opponentBlockUpdateCount, setOpponentBlockUpdateCount ] = useState(0);
    const [ opponentNextBlock, setOpponentNextBlock ] = useState(null);
    const [ isGameStarted,     setIsGameStarted ] = useState(false);

    useEffect(() => {
    
        if (playerName === 'player2') {
            setOpponentExist(true);
        }

        store.dispatch(startGameSuccess(store.getState().socket));
        store.dispatch(startGameFailed(store.getState().socket));
        store.dispatch(opponentJoin(store.getState().socket));
        store.dispatch(opponentLeft(store.getState().socket));
    
        const unsubscribe = store.subscribe(() => {
          if (store.getState().start) {
            if (store.getState().start === true) {
                setErrorMessage('');
            } else {
                if (store.getState().res) {
                    console.log('Failed to start game due to: ', store.getState().res);
                    setErrorMessage('Failed to start game.');
                }
            }
          }

          if (store.getState().op_join) {
            if (store.getState().op_join === true) {
                setMessage(store.getState().joinedMember.player + ' joined the room');
                setOpponentExist(true);
            }
          }

          if (store.getState().op_left) {
            if (store.getState().op_left === true) {
                setMessage('Opponent left the room');
                setOpponentExist(false);
                if (isGameStarted) {
                    setGameEnd(true);
                    setOpponentGameEnd(true);
                }
            }
          }

        });
    
        return () => {
          unsubscribe();
        };
    
    }, [playerName, isGameStarted]);

    const handleStart = () => {
        store.dispatch(startGame(store.getState().socket));
        setIsGameStarted(true);
    };

    const handleMessageEvent = (message) => {
        if (message.event === 'newPuzzle') {
            const init = message.data.type;
            if (0 <= init && init < 7) {
                if (blockUpdateCount === 0) {
                    setInitialShape(shapes[shapeIndex[init]]);
                }
                setNextBlock(shapes[shapeIndex[init]]);
                setBlockUpdateCount(count => count + 1);
            } else {
                console.log('Received shape index is invalid:', init);
            }
        } else if (message.event === 'op_puzzle') {
            if (message.data.player !== playerName) {
                setOpponentNextBlock(shapes[shapeIndex[message?.data?.type]]);
                setOpponentBlockUpdateCount(count => count + 1);
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
                    store.dispatch(gameEndWithWin(store.getState().socket));
                    setMessage(message.data.player + ' is Game Over. You Win!');
                    setGameEnd(true);
                    setOpponentGameEnd(true);
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
                    setErrorMessage('Game Over!!!');
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
            <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
            <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>
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
                                nextBlock={nextBlock}
                                blockUpdateCount={blockUpdateCount}
                            />
                        </div>
                        {
                            opponentExist && 
                            (
                                <div style={{ margin: '50px' }}>
                                    <p>Opponent's Board</p>
                                <OpponentBoard 
                                    addPenaltyRowCount={addPenaltyRowCount}
                                    gameEnd={opponentGameEnd}
                                    index={index}
                                    indexPenaltyAdded={indexPenaltyAdded}
                                    initialShape={initialShape} 
                                    opponentAction={opponentAction} 
                                    opponentNextBlock={opponentNextBlock}
                                    opponentBlockUpdateCount={opponentBlockUpdateCount}
                                    />
                                </div>
                            )
                        }
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
