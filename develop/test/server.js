import chai from "chai"
import {startServer, configureStore} from './helpers/server'
import rootReducer from '../src/client/reducers'
import {ping} from '../src/client/actions/server'
import io from 'socket.io-client'
import params from '../params'

chai.should()

describe('Server test', function(){
  let tetrisServer
  before(cb => startServer( params.server, function(err, server){
    tetrisServer = server
    cb()
  }))

  after(function(done){tetrisServer.stop(done)})


  it('connection', function(done){

	const socket = io(params.server.url);
	const initialState = {}
    socket.on('connect', function() {
      done();
    })

  });


  it('joinRoomSuccess_player1', function(done){
	const socket = io(params.server.url);
	const initialState = {}

    socket.emit('joinRoom', '1234');
    // socket.emit('joinRoom', '1234');
	socket.on('joinRoomSuccess', (response) => {
		done();
	});

  });

  it('joinRoomSuccess_player2', function(done){
	const socket = io(params.server.url);
	const initialState = {}

    socket.emit('joinRoom', '1234');
    // socket.emit('joinRoom', '1234');
	socket.on('joinRoomSuccess', (response) => {
		console.log(response);
		done();
	});
  });


  it('joinRoomSuccess_Failed', function(done){
	const socket = io(params.server.url);
	const initialState = {}

    socket.emit('joinRoom', '1234');

	socket.on('joinRoomFailed', (response) => {
		done();
		// expect(response, 'Room is full');
	});
  });


  it('leaveRoom', function(done){
	const socket = io(params.server.url);
	const initialState = {}

    socket.emit('leaveRoom', '1234');

	socket.on('leaveRoomFailed', (response) => {
		done();
		// expect(response, 'Room is full');
	});
  });


//   it('should pong', function(done){
//     done();
//     // const initialState = {}
//     // const socket = io(params.server.url)
//     // const store =  configureStore(rootReducer, socket, initialState, {
//     //   'pong': () =>  done()
//     // })
//     // store.dispatch(ping())
//   });
});

