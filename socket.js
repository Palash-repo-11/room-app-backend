module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('join-room', ({ roomId, userId, userName }) => {
            socket.join(roomId);
            console.log(`${userName} joined room ${roomId}`);
            socket.broadcast.to(roomId).emit('user-connected', { userId, userName });

            socket.on('video-mute', (status) => {
                socket.broadcast.to(roomId).emit('video-status', { userId, status });
            });

            socket.on('audio-mute', (status) => {
                socket.broadcast.to(roomId).emit('audio-status', { userId, status });
            });

            socket.on('disconnect', () => {
                socket.broadcast.to(roomId).emit('user-disconnected', { userId });
            });
        });
    });
};
