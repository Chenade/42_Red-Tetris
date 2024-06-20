import { jest } from '@jest/globals';
import TetrisGame from '../src/server/TetrisGame';
import TetrisRoom from '../src/server/TetrisRoom';
import TetrisPlayer from '../src/server/TetrisPlayer';

jest.mock('../src/server/TetrisRoom');
jest.mock('../src/server/TetrisPlayer');

describe('TetrisGame', () => {
    let io;
    let socket;
    let game;
    let room;

    beforeEach(() => {
        io = {
            on: jest.fn(),
            to: jest.fn(() => io),
            emit: jest.fn(),
        };
        socket = {
            id: 'socket1',
            join: jest.fn(),
            leave: jest.fn(),
            on: jest.fn(),
            to: jest.fn(() => socket),
            emit: jest.fn(),
        };
        game = new TetrisGame(io);

        room = {
            status: 'waiting',
            addPlayer: jest.fn(),
            removePlayer: jest.fn(),
            getPlayers: jest.fn(() => []),
            startGame: jest.fn(),
            endGame: jest.fn(),
            getStatus: jest.fn(() => 'waiting')
        };
    });

    test('should initialize and set up connection event', () => {
        game.init();
        expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    test('should handle connection event', () => {
        game.handleConnection(socket);

        expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('joinRoom', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('leaveRoom', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('start', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('stop', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('should handle player disconnect', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set('socket1', player);
        game.leaveRoom = jest.fn();

        game.handleDisconnect(socket);
        expect(game.leaveRoom).toHaveBeenCalledWith(socket);
        expect(game.socketToPlayer.has('socket1')).toBe(false);
    });

    test('should handle disconnect when player does not exist', () => {
        game.handleDisconnect(socket);
        expect(game.socketToPlayer.has('socket1')).toBe(false);
    });

    test('should handle player leaving room', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set('socket1', player);
        game.leaveRoom = jest.fn();

        game.handleLeaveRoom(socket);
        expect(game.leaveRoom).toHaveBeenCalledWith(socket);
    });

    test('should handle leaveRoom when player does not exist', () => {
        game.handleLeaveRoom(socket);
        expect(game.leaveRoom).not.toHaveBeenCalled();
    });

    test('should handle joinRoom when room does not exist', () => {
        TetrisRoom.mockImplementation(() => room);
        game.joinRoom = jest.fn();

        game.handleJoinRoom(socket, 'room1');
        expect(game.rooms['room1']).toBeDefined();
        expect(game.joinRoom).toHaveBeenCalledWith('room1', socket);
    });

    test('should handle joinRoom when room exists and is not full', () => {
        game.rooms['room1'] = room;
        game.joinRoom = jest.fn();

        game.handleJoinRoom(socket, 'room1');
        expect(game.joinRoom).toHaveBeenCalledWith('room1', socket);
    });

    test('should handle joinRoom when room is full', () => {
        room.getPlayers = jest.fn(() => [1, 2]);
        game.rooms['room1'] = room;

        game.handleJoinRoom(socket, 'room1');
        expect(socket.emit).toHaveBeenCalledWith('joinRoomFailed', 'Room is full');
    });

    test('should handle joinRoom when room is playing', () => {
        room.status = 'playing';
        game.rooms['room1'] = room;

        game.handleJoinRoom(socket, 'room1');
        expect(socket.emit).toHaveBeenCalledWith('joinRoomFailed', 'Room already started');
    });

    test('should create and join a new room', () => {
        TetrisRoom.mockImplementation(() => room);
        game.joinRoom = jest.fn();

        game.handleJoinRoom(socket, 'newRoom');
        expect(game.rooms['newRoom']).toBeDefined();
        expect(game.joinRoom).toHaveBeenCalledWith('newRoom', socket);
    });

    test('should handle start event when player is player1', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(room.startGame).toHaveBeenCalled();
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('start', 'player1');
    });

    test('should handle start event when player is not player1', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game cannot be started by you');
    });

    test('should handle start event when game is already started', () => {
        room.status = 'playing';
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game already started');
    });

    test('should handle stop event when player1 stops the game', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;
        game.endGame = jest.fn();

        game.handleStop(socket);
        expect(game.endGame).toHaveBeenCalledWith(socket, 'Game stopped by player1');
    });

    test('should handle stop event when player is not player1', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player);

        game.handleStop(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game cannot be stopped by you');
    });

    test('should handle end event', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;
        game.endGame = jest.fn();

        game.handleEnd(socket, 'Player1');
        expect(game.endGame).toHaveBeenCalledWith(socket, 'Player1 wins');
    });

    test('should handle message event', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        player.getRoomId = jest.fn(() => 'room1');
        game.socketToPlayer.set(socket.id, player);
        const eventData = JSON.stringify({ event: 'testEvent', info: 'testInfo' });

        game.handleMessage(socket, eventData);
        expect(socket.to).toHaveBeenCalledWith('room1');
        expect(socket.emit).toHaveBeenCalledWith('message', { event: 'op_testEvent', data: { player: 'player1', data: 'testInfo' } });
    });

    test('should handle next puzzle message event', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        player.getRoomId = jest.fn(() => 'room1');
        player.getPuzzle = jest.fn(() => 1);
        game.socketToPlayer.set(socket.id, player);
        const eventData = JSON.stringify({ event: 'next' });

        game.handleMessage(socket, eventData);
        expect(socket.to).toHaveBeenCalledWith('room1');
        expect(socket.emit).toHaveBeenCalledWith('message', { event: 'newPuzzle', data: { type: 1 } });
    });

    test('should call endGame and emit gameOver', () => {
        game.rooms['room1'] = room;
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);

        game.endGame(socket, 'Player1 wins');
        expect(room.endGame).toHaveBeenCalled();
        expect(socket.to).toHaveBeenCalledWith('room1');
        expect(socket.emit).toHaveBeenCalledWith('gameOver', { message: 'Player1 wins' });
    });

    test('should not call endGame if room does not exist', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);

        game.endGame(socket, 'Player1 wins');
        expect(room.endGame).not.toHaveBeenCalled();
    });

    test('should handle invalid message event', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        player.getRoomId = jest.fn(() => 'room1');
        game.socketToPlayer.set(socket.id, player);
        const eventData = 'invalid';

        game.handleMessage(socket, eventData);
        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });
});
