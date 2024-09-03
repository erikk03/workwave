const express = require('express');
const { createServer } = require('https');
const fs = require('fs');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Define SSL certificate and key
  const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
  };


  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Create HTTPS server
  createServer(options, server).listen(3000, () => {
    console.log('Server running on https://localhost:3000');
  });
});
