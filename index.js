const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const elitePlayers = [
  /* Los 75 nombres que definimos anteriormente */
];

let rooms = {};

io.on('connection', socket => {
  socket.on('createRoom', ({ name }) => {
    const roomCode = Math.random().toString(36).substr(2,4).toUpperCase();
    rooms[roomCode] = { players: [{ id: socket.id, name }], leader: socket.id };
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    io.to(roomCode).emit('updatePlayers', rooms[roomCode].players);
  });

  socket.on('joinRoom', ({ code, name }) => {
    const room = rooms[code];
    if (!room || room.players.length >= 4) return;
    room.players.push({ id: socket.id, name });
    socket.join(code);
    io.to(code).emit('updatePlayers', room.players);
  });

  socket.on('startRound', code => {
    const room = rooms[code];
    if (!room || room.players.length !== 4) return;
    const impostorIndex = Math.floor(Math.random() * 4);
    const chosenName = elitePlayers[Math.floor(Math.random() * elitePlayers.length)];
    room.players.forEach((p,i) => {
      const role = (i === impostorIndex) ? "Impostor" : chosenName;
      io.to(p.id).emit('roleAssigned', role);
    });
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      const r = rooms[code];
      r.players = r.players.filter(p => p.id !== socket.id);
      if (r.players.length === 0) delete rooms[code];
      else io.to(code).emit('updatePlayers', r.players);
    }
  });
});

http.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
