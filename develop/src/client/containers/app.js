import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import Game from '../components/Game';
import JoinPage from '../components/JoinPage';
import {store} from '../index'
import socket from '../index';
import { test } from '../actions/alert'

const App = ({message}) => {

  useEffect(() => {
    
    test(socket);

    const unsubscribe = store.subscribe(() => {
      console.log("state:", store.getState());
    });

    return () => {
      unsubscribe();
    };

  }, []);

  const [playerInfo, setPlayerInfo] = useState(null);

  const handleJoinSuccess = (room, playerName) => {
      const gameUrl = `/${room}/${playerName}`;
      window.history.pushState({ room, playerName }, '', gameUrl);
      setPlayerInfo({ room, playerName });
  };

  return (
      <div>
          {!playerInfo ? (
              <JoinPage onJoinSuccess={handleJoinSuccess} />
          ) : (
              <Game room={playerInfo.room} playerName={playerInfo.playerName} />
          )}
      </div>
  );
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}
export default connect(mapStateToProps, null)(App)


