import React, { useState } from 'react';
import socket from '../index';

const JoinPage = ({ onJoinSuccess }) => {
    const [room, setRoom] = useState('');
    const [error, setError] = useState('');

    const handleJoin = () => {
        socket.emit('joinRoom', room);
    
        socket.on('joinRoomSuccess', (response) => {
            onJoinSuccess(room, response.player);
        });
    
        socket.on('joinRoomFailed', (response) => {
            setError(response);
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
            <button onClick={handleJoin}>Join</button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default JoinPage;