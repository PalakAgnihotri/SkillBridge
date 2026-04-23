const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const matchRoutes   = require('./routes/matches');
const sessionRoutes = require('./routes/sessions');
const ratingRoutes  = require('./routes/ratings');
const { socketHandler } = require('./utils/socketHandler');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/matches',  matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ratings',  ratingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

socketHandler(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));
