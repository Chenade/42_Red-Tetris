const request = require('supertest');
const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');
const TetrisServer = require('../src/server/TetrisServer').default;

// Mock implementation of log function to prevent console output during tests
// const mockLog = jest.fn();

jest.mock('console', () => ({
	mockLog : jest.fn(),
  	log: jest.fn(),
}));

describe('TetrisServer', () => {
  let tetrisServer;
  // let mockLog;

  beforeAll(() => {
    const serverParams = {
      host: 'localhost',
      port: 3000,
      url: 'http://localhost:3000'
    };
    
    tetrisServer = new TetrisServer(serverParams);
    tetrisServer.init();
  });

  afterAll((done) => {
    tetrisServer.stop(done);
  });


  it('should start and stop server correctly', async () => {
  });

  // Add more tests as needed

});
