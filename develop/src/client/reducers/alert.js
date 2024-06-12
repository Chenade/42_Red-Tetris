import { ALERT_POP, SET_SOCKET, CONNECT_SOCKET, DISCONNECT_SOCKET, TEST_RECEIVED } from '../actions/alert'

const reducer = (state = {} , action) => {
  switch(action.type){
    case ALERT_POP:
      return { message: action.message }
    case SET_SOCKET:
      return { socket: action.socket }
    case CONNECT_SOCKET:
      return { socket: action.socket }
    case DISCONNECT_SOCKET:
      return { socket: null }
    case TEST_RECEIVED:
      return { message: action.payload }
    default: 
      return state
  }
}

export default reducer
