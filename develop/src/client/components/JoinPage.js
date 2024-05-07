import React, { useState } from 'react';
import socket from '../index'; // Ensure this is correctly imported

const JoinPage = ({ onJoinSuccess }) => {
    const [room, setRoom] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');

    const handleJoin = () => {
        socket.emit('joinRoom', room, (response) => {
            if (response.success) {
                onJoinSuccess(room, playerName);
            } else {
                setError(response.message);
            }
        });
    };

    return (
        <div>
            <h1>Join Game</h1>
            <input
                type="text"
                placeholder="Room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <input
                type="text"
                placeholder="Player Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
            />
            <button onClick={handleJoin}>Join</button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default JoinPage;