import { Server, Socket } from 'socket.io';
import chatSocket from './chat.socket';

export default (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Register handlers
    chatSocket(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
