export const ALERT_POP = 'ALERT_POP'
export const SET_SOCKET = 'SET_SOCKET'
export const CONNECT_SOCKET = 'CONNECT_SOCKET'
export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET'
export const JOIN_ROOM = 'JOIN_ROOM'
export const JOIN_ROOM_SUCCESS = 'JOIN_ROOM_SUCCESS'
export const JOIN_ROOM_FAILED = 'JOIN_ROOM_FAILED'
export const START_GAME = 'START_GAME'
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'
export const GAME_END_WITH_WIN = 'GAME_END_WITH_WIN'
export const SEND_MESSAGE = 'SEND_MESSAGE'

export const alert = (message) => {
  return {
    type: ALERT_POP,
    message
  }
}

export const setSocket = (socket) => {
  return {
    type: SET_SOCKET,
    socket
  }
}

export const connectSocket = (socket) => {
  socket.on('connect', () => {
    console.log('connected')
  })
  return {
    type: CONNECT_SOCKET,
    socket
  }
}

export const disconnectSocket = (socket) => {
  socket.on('disconnect', () => {
    console.log('disconnected')
  })
  return {
    type: DISCONNECT_SOCKET,
    socket
  }
}

export const joinRoom = (socket, room) => {
  socket.emit('joinRoom', room);
  return {
    type: JOIN_ROOM,
    payload: { socket, room }
  }
}

export const joinRoomSuccess = (socket) => {
  return (dispatch) => {
    socket.on('joinRoomSuccess', (data) => {
      dispatch({
        type: JOIN_ROOM_SUCCESS,
        payload: { socket, join: true, res: data }
      });
    });
  }
}

export const joinRoomFailed = (socket) => {
  return (dispatch) => {
    socket.on('joinRoomFailed', (data) => {
      dispatch({
        type: JOIN_ROOM_FAILED,
        payload: { socket, join: false, res: data }
      });
    });
  }
}

export const startGame = (socket) => {
  socket.emit('start');
  return {
    type: START_GAME,
    payload: { socket }
  }
}

export const receiveMessage = (socket) => {
  return (dispatch) => {
    socket.on('message', (data) => {
      dispatch({
        type: RECEIVE_MESSAGE,
        payload: { socket, message: data }
      });
    });
  }
}

export const gameEndWithWin = (socket) => {
  socket.emit('message', JSON.stringify({ event: 'action', info: { data: 'gameEndWithWin' } }));
  return {
    type: GAME_END_WITH_WIN,
    payload: { socket }
  }
}

export const sendMessage = (socket, message) => {
  socket.emit('message', message);
  return {
    type: SEND_MESSAGE,
    payload: { socket }
  }
}

