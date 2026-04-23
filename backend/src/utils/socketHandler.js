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

    // ── WebRTC signalling ──
    socket.on('webrtc:offer', ({ to, offer }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc:offer', { from: socket.id, offer });
    });

    socket.on('webrtc:answer', ({ to, answer }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc:answer', { answer });
    });

    socket.on('webrtc:ice', ({ to, candidate }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc:ice', { candidate });
    });

    socket.on('webrtc:end', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit('webrtc:end');
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
