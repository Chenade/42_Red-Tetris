const params = {
	server:{
	   host: '0.0.0.0'
	 , port: 3000
	 , get url(){ return 'http://' + this.host + ':' + this.port } 
	},
	client:{
		host: '0.0.0.0'
	  , port: 8080
	  , get url(){ return 'http://' + this.host + ':' + this.port } 
  }
}

import { create } from './index.js';

create(params.server)
  .then(({ stop }) => {
    console.log('Tetris application running on', params.server.host, '...');
    process.on('SIGINT', () => {
      stop(() => {
        console.log('Tetris application stopped.');
        process.exit();
      });
    });
  })
  .catch((err) => {
    console.error('Failed to start Tetris application:', err);
  });
