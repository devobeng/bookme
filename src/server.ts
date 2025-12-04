import http from 'http';
import app from './app';
import connectDB from './config/db';
import { port } from './config/env';
import { Server } from 'socket.io';
import initializeSockets from './sockets';

// Connect to Database
connectDB();

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSockets(io);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
