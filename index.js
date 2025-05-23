const express = require('express')
const pool = require('./pool')
const { PORT, OPTIONS } = require('./config')
const app = express()
const app2 = express()
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const { usersRouter } = require('./routes/users.route')
const { meetingRouter } = require('./routes/meeting.route')
const { loginRouter } = require('./routes/login.route')
const { MeetingTransaction } = require('./repo/db')


const server = http.createServer(app);

// Setup Socket.IO on top of HTTP server

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
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

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('join-room', ({ roomId, userId, userName }) => {
//         console.log(`${userName} joined room ${roomId}`);
//         socket.join(roomId);

//         socket.broadcast.to(roomId).emit('user-connected', { userId, userName });

//         socket.on('disconnect', () => {
//             console.log(`${userName} disconnected from room ${roomId}`);
//             socket.broadcast.to(roomId).emit('user-disconnected', { userId });
//         });
//     });
// });


io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
  
    socket.on('join-room', async ({ roomId, userId, userName, isOwner }) => {
      console.log(`${userName} joined room ${roomId}`);
      socket.join(roomId);
  
      try {
        // 🔥 Record "joined" event
        await MeetingTransaction.createTransaction(userId, roomId, 'joined');
      } catch (err) {
        console.error('Failed to create join transaction:', err);
      }
  
      socket.broadcast.to(roomId).emit('user-connected', { userId, userName });
  
      // 📩 Chat handling
      socket.on('send-message', ({ message }) => {
        socket.to(roomId).emit('receive-message', {
          userId,
          userName,
          message,
          timestamp: new Date().toISOString(),
        });
      });
  
      // 🔌 Owner can share screen
      socket.on('start-share', async () => {
        if (isOwner) {
          await MeetingTransaction.createTransaction(userId, roomId, 'share');
          socket.broadcast.to(roomId).emit('owner-started-share', { userId });
        }
      });
  
      socket.on('stop-share', async () => {
        if (isOwner) {
          await MeetingTransaction.createTransaction(userId, roomId, 'stop');
          socket.broadcast.to(roomId).emit('owner-stopped-share', { userId });
        }
      });
  
      socket.on('disconnect', async () => {
        console.log(`${userName} disconnected from ${roomId}`);
        socket.broadcast.to(roomId).emit('user-disconnected', { userId });
  
        try {
          await MeetingTransaction.createTransaction(userId, roomId, 'left');
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

