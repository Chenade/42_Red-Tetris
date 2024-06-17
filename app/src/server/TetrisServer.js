import fs from 'fs';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { log } from 'console';
import TetrisGame from './TetrisGame.js';

class TetrisServer {
  constructor(params) {
    this.params = params;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, { cors: { origin: '*' } });
    this.game = new TetrisGame(this.io);
  }

  init() {
    this.app.use(cors());
    // this.app.get('/bundle.js', this.serveBundle);
    // this.app.get('/', this.serveIndex);

    this.server.listen(this.params, () => {
      // console.log(`tetris listen on ${this.params.url}`);
    });

    this.game.init();
  }

  // serveBundle(req, res) {
  //   fs.readFile(__dirname + '/../../build/bundle.js', (err, data) => {
  //     if (err) {
  //       logerror(err);
  //       res.writeHead(500);
  //       return res.end('Error loading bundle.js');
  //     }
  //     res.writeHead(200);
  //     res.end(data);
  //   });
  // }

  // serveIndex(req, res) {
  //   fs.readFile(__dirname + '../client/public/index.html', (err, data) => {
  //     if (err) {
  //       logerror(err);
  //       res.writeHead(500);
  //       return res.end('Error loading index.html');
  //     }
  //     res.writeHead(200);
  //     res.end(data);
  //   });
  // }

  stop(cb) {
    this.io.close();
    this.server.close(() => {
      log(`Engine stopped.`);
      cb();
    });
  }
}

export default TetrisServer;
