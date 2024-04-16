import { connect } from 'react-redux'
import Board from '../components/Board';
import React from 'react'

const App = ({message}) => {
  return (
    <Board />
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}
export default connect(mapStateToProps, null)(App)


