export const ALERT_POP = 'ALERT_POP'
export const SET_SOCKET = 'SET_SOCKET'
export const CONNECT_SOCKET = 'CONNECT_SOCKET'
export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET'

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
