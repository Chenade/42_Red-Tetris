import { 
  ALERT_POP, 
  CONNECT_SOCKET, 
  DISCONNECT_SOCKET, 
  GAME_END_WITH_WIN,
  JOIN_ROOM_FAILED,
  JOIN_ROOM_SUCCESS,
  JOIN_ROOM, 
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  SET_SOCKET,
  START_GAME,
} from '../actions/alert'

const reducer = (state = {} , action) => {
  switch(action.type){
    case ALERT_POP:
      return { message: action.message }
    case SET_SOCKET:
      return { socket: action.payload }
    case CONNECT_SOCKET:
      return { socket: action.payload }
    case DISCONNECT_SOCKET:
      return { socket: action.payload }
    case JOIN_ROOM:
      return { ...state, socket: action.payload.socket, room: action.payload.room }
    case JOIN_ROOM_SUCCESS:
      return { ...state, join: action.payload.join, res: action.payload.res }
    case JOIN_ROOM_FAILED:
      return { ...state, join: action.payload.join, res: action.payload.res }
    case START_GAME:
      return { ...state, socket: action.payload.socket }
    case RECEIVE_MESSAGE:
      return { ...state, socket: action.payload.socket, message: action.payload.message }
    case GAME_END_WITH_WIN:
      return { socket: action.payload.socket }
    case SEND_MESSAGE:
      return { socket: action.payload.socket }
    default: 
      return state
  }
}

export default reducer
