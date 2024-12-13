import React, { useState } from 'react';
import { connect } from 'react-redux'
import Game from '../components/Game';
import JoinPage from '../components/JoinPage';

const App = () => {

  const [roomName, setRoomName] = useState(null);
  const [playerName, setPlayerName] = useState(null);

  const handleJoinSuccess = (room, playerName) => {
      const gameUrl = `/${room}/${playerName}`;
      window.history.pushState({ room, playerName }, '', gameUrl);
      setRoomName(room);
      setPlayerName(playerName);
  };

  return (
      <div>
          {!roomName || !playerName ? (
              <JoinPage onJoinSuccess={handleJoinSuccess} />
          ) : (
              <Game room={roomName} playerName={playerName} setPlayerName={setPlayerName} />
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


