import { jest } from '@jest/globals';
import TetrisGame from '../src/server/TetrisGame';
import TetrisRoom from '../src/server/TetrisRoom';
import TetrisPlayer from '../src/server/TetrisPlayer';

jest.mock('../src/server/TetrisRoom');
jest.mock('../src/server/TetrisPlayer');

describe('TetrisGame - joinRoom and leaveRoom', () => {
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
            emit: jest.fn(),
            to: jest.fn(() => socket),
        };
        game = new TetrisGame(io);

        room = {
            addPlayer: jest.fn(),
            removePlayer: jest.fn(),
            getPlayers: jest.fn(() => []),
        };

        game.rooms['room1'] = room;
    });

    describe('joinRoom', () => {
        test('should successfully join room as player1', () => {
            room.getPlayers = jest.fn(() => []);
            game.joinRoom('room1', socket);
            expect(socket.join).toHaveBeenCalledWith('room1');
            expect(room.addPlayer).toHaveBeenCalled();
            expect(socket.emit).toHaveBeenCalledWith('joinRoomSuccess', { player: 'player1', roomId: 'room1' });
            expect(socket.to('room1').emit).toHaveBeenCalledWith('op_joined', { player: 'player1' });
        });

        test('should successfully join room as player2', () => {
            const existingPlayer = new TetrisPlayer('socket2', 'room1', 'player1');
            room.getPlayers = jest.fn(() => [existingPlayer]);
            game.joinRoom('room1', socket);
            expect(socket.join).toHaveBeenCalledWith('room1');
            expect(room.addPlayer).toHaveBeenCalled();
            expect(socket.emit).toHaveBeenCalledWith('joinRoomSuccess', { player: 'player2', roomId: 'room1' });
            expect(socket.to('room1').emit).toHaveBeenCalledWith('op_joined', { player: 'player2' });
        });

        test('should handle player joining when room is full', () => {
            const player1 = new TetrisPlayer('socket2', 'room1', 'player1');
            const player2 = new TetrisPlayer('socket3', 'room1', 'player2');
            room.getPlayers = jest.fn(() => [player1, player2]);
            game.joinRoom('room1', socket);
            expect(socket.emit).toHaveBeenCalledWith('joinRoomFailed', 'Room is full');
        });
    });

    describe('leaveRoom', () => {
        test('should successfully leave room', () => {
            const player = new TetrisPlayer('socket1', 'room1', 'player1');
            game.socketToPlayer.set(socket.id, player);
            game.leaveRoom(socket);
            expect(socket.leave).toHaveBeenCalledWith('room1');
            expect(room.removePlayer).toHaveBeenCalledWith('player1');
            expect(socket.to('room1').emit).toHaveBeenCalledWith('op_left', {});
        });

        test('should handle player leaving as player1 and promoting player2', () => {
            const player1 = new TetrisPlayer('socket1', 'room1', 'player1');
            const player2 = new TetrisPlayer('socket2', 'room1', 'player2');
            room.getPlayers = jest.fn(() => [player1, player2]);
            game.socketToPlayer.set('socket1', player1);
            game.socketToPlayer.set('socket2', player2);

            game.leaveRoom(socket);
            expect(socket.leave).toHaveBeenCalledWith('room1');
            expect(room.removePlayer).toHaveBeenCalledWith('player1');
            expect(player2.setPlayer).toHaveBeenCalledWith('player1');
            expect(io.to('socket2').emit).toHaveBeenCalledWith('joinRoomSuccess', { player: 'player1', roomId: 'room1' });
        });

        test('should handle player leaving as player1 with no other players', () => {
            const player = new TetrisPlayer('socket1', 'room1', 'player1');
            room.getPlayers = jest.fn(() => [player]);
            game.socketToPlayer.set(socket.id, player);

            game.leaveRoom(socket);
            expect(socket.leave).toHaveBeenCalledWith('room1');
            expect(room.removePlayer).toHaveBeenCalledWith('player1');
            expect(game.rooms['room1']).toBeUndefined();
        });

        test('should handle leaveRoom when player does not exist', () => {
            game.leaveRoom(socket);
            expect(socket.leave).not.toHaveBeenCalled();
            expect(room.removePlayer).not.toHaveBeenCalled();
        });
    });
});
