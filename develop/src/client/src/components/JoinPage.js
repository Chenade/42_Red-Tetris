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
          if (store.getState().join === true) {
            onJoinSuccess(store.getState().res.roomId, store.getState().res.player);
          } else {
            if (store.getState().res) {
              setError(store.getState().res);
            }
          }
        }
        if (store.getState().joinRoomFailed) {
          setError(store.getState().res);
          store.getState().joinRoomFailed = false;
        }
      });
  
      return () => {
        unsubscribe();
      };
  
    });

    const handleJoin = () => {
        if (room === '') {
            setError('Room is empty');
            return;
        }
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
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default JoinPage;