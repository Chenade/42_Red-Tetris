import React, { useState, useEffect } from 'react';
import { store } from '../index';
import { joinRoom, joinRoomSuccess, joinRoomFailed } from '../actions/alert'

const JoinPage = ({ onJoinSuccess }) => {
    const [room, setRoom] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
    
        store.dispatch(joinRoomSuccess(store.getState().socket));
        store.dispatch(joinRoomFailed(store.getState().socket));
    
        const unsubscribe = store.subscribe(() => {
          if (store.getState().join) {
            onJoinSuccess(store.getState().res.roomId, store.getState().res.player);
          } else {
            if (store.getState().res) {
              setError(store.getState().res);
            }
          }
        });
    
        return () => {
          unsubscribe();
        };
    
      }, []);

    const handleJoin = () => {
        store.dispatch(joinRoom(store.getState().socket, room));
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