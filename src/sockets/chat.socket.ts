import { Server, Socket } from 'socket.io';

interface MessageData {
  roomId: string;
  message: string;
}

export default (io: Server, socket: Socket): void => {
  const joinRoom = (roomId: string): void => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  };

  const sendMessage = (data: MessageData): void => {
    const { roomId, message } = data;
    io.to(roomId).emit('receive_message', message);
  };

  socket.on('join_room', joinRoom);
  socket.on('send_message', sendMessage);
};
