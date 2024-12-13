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
        expect(socket.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('start', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('stop', expect.any(Function));
    });

    test('should handle player disconnect', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set('socket1', player);
        game.leaveRoom = jest.fn();

        game.handleDisconnect(socket);
        expect(game.leaveRoom).toHaveBeenCalledWith(socket);
        expect(game.socketToPlayer.has('socket1')).toBe(false);
    });

    test('should handle player leaving room', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set('socket1', player);
        game.leaveRoom = jest.fn();

        game.handleLeaveRoom(socket);
        expect(game.leaveRoom).toHaveBeenCalledWith(socket);
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

    test('should handle start event when player is not player1', () => {
        const player2 = new TetrisPlayer('socket2', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player2);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game cannot be started by you');
    });

    test('should handle start event when game is already started', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        room.status = 'playing';
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game already started');
    });

    test('should handle start event when player1 starts the game', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('start', 'player1');
        expect(room.startGame).toHaveBeenCalled();
    });

    test('should handle end event', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        room.status = 'playing';
        game.rooms['room1'] = room;
        game.endGame = jest.fn();

        game.handleEnd(socket, 'winner');
        expect(game.endGame).toHaveBeenCalledWith(socket, 'winner wins');
    });

    test('should handle stop event when player is not player1', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player);
        room.status = 'playing';
        game.rooms['room1'] = room;

        game.handleStop(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Game cannot be stopped by you');
    });

    test('should handle stop event when player1 stops the game', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        room.status = 'playing';
        game.rooms['room1'] = room;
        game.endGame = jest.fn();

        game.handleStop(socket);
        expect(game.endGame).toHaveBeenCalledWith(socket, 'Game stopped by player1');
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
        player.nextPuzzle = jest.fn();
        player.getPuzzle = jest.fn(() => 1);
        game.socketToPlayer.set(socket.id, player);
        const eventData = JSON.stringify({ event: 'next', info: 'testInfo' });

        game.handleMessage(socket, eventData);
        expect(player.nextPuzzle).toHaveBeenCalled();
        expect(io.to).toHaveBeenCalledWith(socket.id);
        expect(io.emit).toHaveBeenCalledWith('message', { event: 'newPuzzle', data: { type: 1 } });
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('message', { event: 'op_puzzle', data: { player: 'player1', type: 1 } });
    });

    // Additional tests

    test('should reassign player1 role when player1 leaves', () => {
        const player1 = new TetrisPlayer('socket1', 'room1', 'player1');
        const player2 = new TetrisPlayer('socket2', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player1);
        game.socketToPlayer.set('socket2', player2);
        game.rooms['room1'] = room;
        room.getPlayers = jest.fn(() => [player2]);

        game.handleLeaveRoom(socket);
        expect(player2.getPlayer).toHaveBeenCalled();
        expect(game.socketToPlayer.get('socket2').getPlayer()).toBe('player1');
    });

    test('should delete room when last player leaves', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        game.socketToPlayer.set(socket.id, player);
        game.rooms['room1'] = room;
        room.getPlayers = jest.fn(() => []);

        game.handleLeaveRoom(socket);
        expect(game.rooms['room1']).toBeUndefined();
    });

    test('should broadcast message to other players in the room', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        player.getRoomId = jest.fn(() => 'room1');
        game.socketToPlayer.set(socket.id, player);

        const eventData = JSON.stringify({ event: 'chat', info: 'Hello World' });
        game.handleMessage(socket, eventData);

        expect(socket.to).toHaveBeenCalledWith('room1');
        expect(socket.emit).toHaveBeenCalledWith('message', { event: 'op_chat', data: { player: 'player1', data: 'Hello World' } });
    });

    test('should handle invalid JSON message gracefully', () => {
        const player = new TetrisPlayer('socket1', 'room1', 'player1');
        player.getRoomId = jest.fn(() => 'room1');
        game.socketToPlayer.set(socket.id, player);

        const eventData = "invalid JSON";
        expect(() => game.handleMessage(socket, eventData)).not.toThrow();
    });

    test('should not start a game if room does not exist', () => {
        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('socket1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Room does not exist');
    });

    test('should not stop a game if room does not exist', () => {
        game.handleStop(socket);
        expect(io.to).toHaveBeenCalledWith('socket1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Room does not exist');
    });

    test('should not end a game if room does not exist', () => {
        game.handleEnd(socket, 'winner');
        expect(io.to).toHaveBeenCalledWith('socket1');
        expect(io.emit).toHaveBeenCalledWith('error', 'Room does not exist');
    });

    test('should handle start game request from player1 even if there are multiple players in room', () => {
        const player1 = new TetrisPlayer('socket1', 'room1', 'player1');
        const player2 = new TetrisPlayer('socket2', 'room1', 'player2');
        game.socketToPlayer.set(socket.id, player1);
        game.socketToPlayer.set('socket2', player2);
        game.rooms['room1'] = room;

        game.handleStart(socket);
        expect(io.to).toHaveBeenCalledWith('room1');
        expect(io.emit).toHaveBeenCalledWith('start', 'player1');
        expect(room.startGame).toHaveBeenCalled();
    });
});
