import {store} from '../index'

export const ALERT_POP = 'ALERT_POP'
export const SET_SOCKET = 'SET_SOCKET'
export const CONNECT_SOCKET = 'CONNECT_SOCKET'
export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET'
export const TEST_RECEIVED = 'TEST_RECEIVED'
export const JOIN_ROOM = 'JOIN_ROOM'
export const JOIN_ROOM_SUCCESS = 'JOIN_ROOM_SUCCESS'
export const JOIN_ROOM_FAILED = 'JOIN_ROOM_FAILED'

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

export const test = (socket) => {
  socket.on('test', (data) => {
    store.dispatch({ type: 'TEST_RECEIVED', payload: data.socketId });
  });
  return {
    type: TEST_RECEIVED,
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

export const joinRoomSuccess = (socket, room) => {
  return (dispatch) => {
    socket.on('joinRoomSuccess', (data) => {
      dispatch({
        type: JOIN_ROOM_SUCCESS,
        payload: { socket, join: true, res: data }
      });
    });
  }
}

export const joinRoomFailed = (socket, room) => {
  return (dispatch) => {
    socket.on('joinRoomFailed', (data) => {
      dispatch({
        type: JOIN_ROOM_FAILED,
        payload: { socket, join: false, res: data }
      });
    });
  }
}
