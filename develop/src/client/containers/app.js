import React, { useState } from 'react';
import { connect } from 'react-redux'
import Game from '../components/Game';
import JoinPage from '../components/JoinPage';

const App = ({message}) => {

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


