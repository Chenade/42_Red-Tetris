import React, { useState, useEffect } from 'react';
import Board from './Board';
import socket from '../index';

const Game = ({ room, playerName }) => {
    // State to control the visibility of the Board
    const [showBoard, setShowBoard] = useState(false);

    // Function to handle the Start button click
    const handleStart = () => {
        setShowBoard(true);
        socket.emit('start', (response) => {
            console.log('emit start and received response', response);
            setError(response);
        });
    };

    useEffect(() => {
        const handleStartEvent = (data) => {
            console.log('received start event', data);
            // Additional logic to handle start event
        };
    
        const handleMessageEvent = (message) => {
            console.log('received message', message);
            // Additional logic to handle message event
        };
    
        socket.on('start', handleStartEvent);
        socket.on('message', handleMessageEvent);
    
        // Cleanup the listeners when the component unmounts
        return () => {
            socket.off('start', handleStartEvent);
            socket.off('message', handleMessageEvent);
        };
    }, []);

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
