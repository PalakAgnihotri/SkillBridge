const onlineUsers = new Map(); // userId -> socketId

exports.socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User comes online
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} is online`);
    });

    // Session request notification
    socket.on('session:request', ({ to, session }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('session:incoming', session);
    });

    // Session accept/reject notification
    socket.on('session:response', ({ to, status, sessionId }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('session:answered', { status, sessionId });
    });

    // ── Video Room Logic ──
    socket.on('join:room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user:joined');
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('webrtc:offer', ({ to, offer }) => {
      // In this setup, 'to' is the roomId
      socket.to(to).emit('webrtc:offer', { from: socket.id, offer });
    });

    socket.on('webrtc:answer', ({ to, answer }) => {
      socket.to(to).emit('webrtc:answer', { answer });
    });

    socket.on('webrtc:ice', ({ to, candidate }) => {
      socket.to(to).emit('webrtc:ice', { candidate });
    });

    socket.on('webrtc:end', ({ to }) => {
      socket.to(to).emit('webrtc:end');
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline`);
          break;
        }
      }
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });
};
