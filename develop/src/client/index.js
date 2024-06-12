import React from 'react'
import ReactDom from 'react-dom'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { storeStateMiddleWare } from './middleware/storeStateMiddleWare'
import reducer from './reducers'
import App from './containers/app'
import { setSocket } from './actions/alert';

const initialState = {}

export const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk, createLogger())
)

// Pass the `socket` instance to your Redux actions or components as needed
// For example, you can dispatch an action to store the socket instance in the Redux store
store.dispatch(setSocket());
store.dispatch({ type: 'CONNECT_SOCKET', payload: store.getState().socket });
store.dispatch({ type: 'DISCONNECT_SOCKET', payload: store.getState().socket });

ReactDom.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('tetris'))

