import TetrisServer from './TetrisServer.js';

const serverParams = {
  host: 'localhost',
  port: 3000,
  url: 'http://localhost:3000'
};

const server = new TetrisServer(serverParams);
server.init();
