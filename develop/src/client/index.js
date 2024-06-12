import React from 'react'
import ReactDom from 'react-dom'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { storeStateMiddleWare } from './middleware/storeStateMiddleWare'
import reducer from './reducers'
import App from './containers/app'
import { alert } from './actions/alert'
import io from 'socket.io-client';

const initialState = {}

const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)

const socket = io('http://localhost:3000');

// Pass the `socket` instance to your Redux actions or components as needed
// For example, you can dispatch an action to store the socket instance in the Redux store
store.dispatch({ type: 'SET_SOCKET', payload: socket });
store.dispatch({ type: 'CONNECT_SOCKET', payload: socket });
store.dispatch({ type: 'DISCONNECT_SOCKET', payload: socket });

ReactDom.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('tetris'))

store.dispatch(alert('Soon, will be here a fantastic Tetris ...'))

export default socket;
