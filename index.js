const express = require('express')
const pool = require('./pool')
const { PORT, OPTIONS } = require('./config')
const app = express()
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const { usersRouter } = require('./routes/users.route')
const { meetingRouter } = require('./routes/meeting.route')
const { loginRouter } = require('./routes/login.route');
const { MeetingTransaction } = require('./repo/db');

const server = http.createServer(app);

// Setup Socket.IO on top of HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // If you're using cookies or auth headers
}));

app.use(express.json())

app.get('/', (req, res) => {
  res.send('WELCOME')
})


app.use('/users', usersRouter)
app.use('/login', loginRouter)
app.use('/meeting', meetingRouter)

// Create HTTP server from express app


// Your socket logic (can be moved to separate socket.js file)
let roomState = {}


function getOrCreateRoom(roomId) {
  if (!roomState[roomId]) {
    roomState[roomId] = {
      ownerMediaStream: null,
      ownerId: '',
      users: [],
      messages: [],
    };
  }
  return roomState[roomId];
}


io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', async ({ roomId, userId, userName, isOwner }) => {
    let socketId = socket.id
    console.log(socketId)
    console.log(`${userName} joined room ${roomId}`);
    const room = getOrCreateRoom(roomId);
    let allUserIds = room.users.map(user => user.userId);
    socket.join(roomId);

    try {
      // 🔥 Record "joined" event
      await MeetingTransaction.createTransaction(userId, roomId, 'joined');
      room.users.push({ userId, userName, })
      let messageObj = {
        state: 'transaction',
        userName,
        userId,
        message: `${userName} joined the meeting`,
        timestamp: new Date().toISOString()
      }
      room.messages.push(messageObj)
      socket.broadcast.to(roomId).emit('user-connected', { userId, userName, });
      socket.to(roomId).emit('receive-message', messageObj);
    } catch (err) {
      console.error('Failed to create join transaction:', err);
    }
    if (!allUserIds.includes(userId)) {
      console.log(room,"room")
      io.to(socket.id).emit('joined-room', room);
    }
    



    // 📩 Chat handling
    socket.on('send-message', (message) => {
      let messageObj = {
        state: 'message',
        userName,
        userId,
        message: message,
        timestamp: new Date().toISOString()
      }
      roomState[roomId].messages.push(messageObj)
      socket.to(roomId).emit('receive-message', messageObj);
    });

    // 🔌 Owner can share screen
    socket.on('start-share', async (stream) => {
      if (isOwner) {
        await MeetingTransaction.createTransaction(userId, roomId, 'share');
        let messageObj = {
          state: 'transaction',
          userName,
          userId,
          message: `${userName} shared screen`,
          timestamp: new Date().toISOString()
        }
        roomState[roomId].messages.push(messageObj)
        roomState[roomId].ownerMediaStream = stream
        socket.to(roomId).emit('receive-message', messageObj);
        socket.broadcast.to(roomId).emit('owner-started-share', stream);
      }
    });

    socket.on('stop-share', async (userId, userName) => {
      if (isOwner) {

        await MeetingTransaction.createTransaction(userId, roomId, 'stop');
        let messageObj = {
          state: 'transaction',
          userName,
          userId,
          message: `${userName} stop sharing screen`,
          timestamp: new Date().toISOString()
        }
        roomState[roomId].messages.push(messageObj)
        roomState[roomId].ownerMediaStream = null
        socket.to(roomId).emit('receive-message', messageObj);
        socket.broadcast.to(roomId).emit('owner-stopped-share', null);
      }
    });

    socket.on('disconnect', async () => {
      try {

        console.log(`${userName} disconnected from ${roomId}`);


        await MeetingTransaction.createTransaction(userId, roomId, 'left');

        let updatedUsers = roomState[roomId].users.filter(user => user.userId !== userId)
        roomState[roomId].users = updatedUsers
        socket.broadcast.to(roomId).emit('user-disconnected', { userId });
        let messageObj = {
          state: 'transaction',
          userName,
          userId,
          message: `${userName} left the meeting`,
          timestamp: new Date().toISOString()
        }
        roomState[roomId].messages.push(messageObj)
        socket.to(roomId).emit('receive-message', messageObj);
        if (roomState[roomId].users.length) {
          await MeetingTransaction.createTransaction(userId, roomId, 'ended');
          let messageObj = {
            state: 'transaction',
            userName,
            userId,
            message: `${userName} ended the meeting`,
            timestamp: new Date().toISOString()
          }
          roomState[roomId].messages.push(messageObj)
          socket.to(roomId).emit('receive-message', messageObj);
          delete roomState[roomId];
        }
      } catch (err) {
        console.error('Failed to create disconnect transaction:', err);
      }
    });
  });
});


pool.connect(OPTIONS).then(() => {
  server.listen(PORT, () => {
    console.log(`SERVER STARTED IN PORT: ${PORT}`)
  })
})