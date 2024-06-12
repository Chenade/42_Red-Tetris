import { 
  ALERT_POP, 
  CONNECT_SOCKET, 
  DISCONNECT_SOCKET, 
  JOIN_ROOM_FAILED,
  JOIN_ROOM_SUCCESS,
  JOIN_ROOM, 
  SET_SOCKET,
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
      default: 
      return state
  }
}

export default reducer
