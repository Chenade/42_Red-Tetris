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
  START_GAME_FAILED,
  START_GAME_SUCCESS,
  START_GAME,
  OPPONENT_JOIN,
  OPPONENT_LEFT,
  SEND_END_GAME_MESSAGE
} from '../actions/alert'

const reducer = (state = {} , action) => {
  switch(action.type){
    case ALERT_POP:
      return { message: action.message }
    case SET_SOCKET:
      return { socket: action.payload.socket }
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
    case START_GAME_SUCCESS:
      return { ...state, socket: action.payload.socket, res: action.payload.res, start: action.payload.start }
    case START_GAME_FAILED:
      return { ...state, socket: action.payload.socket, res: action.payload.res, start: action.payload.start, startGameFailed: action.payload.startGameFailed }
    case RECEIVE_MESSAGE:
      return { ...state, socket: action.payload.socket, message: action.payload.message }
    case GAME_END_WITH_WIN:
      return { socket: action.payload.socket }
    case SEND_MESSAGE:
      return { socket: action.payload.socket }
    case OPPONENT_JOIN:
      return { ...state, socket: action.payload.socket, op_join: action.payload.op_join, joinedMember: action.payload.joinedMember }
    case OPPONENT_LEFT:
      return { ...state, socket: action.payload.socket, op_left: action.payload.op_left }
    case SEND_END_GAME_MESSAGE:
      return { socket: action.payload.socket }
    default:
      return state
  }
}

export default reducer
