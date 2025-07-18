const socket = io();

let currentRoom = "";
let myName = "";

function createRoom() {
  myName = document.getElementById('playerName').value.trim();
  if (!myName) return alert("Ingresá tu nombre");
  socket.emit('createRoom', { name: myName });
}

function showJoin() {
  document.getElementById('joinSection').style.display = 'block';
}

function joinRoom() {
  myName = document.getElementById('playerName').value.trim();
  const code = document.getElementById('roomCodeInput').value.toUpperCase();
  if (!myName || code.length !== 4) return alert("Datos inválidos");
  socket.emit('joinRoom', { code, name: myName });
}

function startRound() {
  socket.emit('startRound', currentRoom);
}

socket.on('roomCreated', code => {
  currentRoom = code;
  document.getElementById('nameInput').style.display = 'none';
  document.getElementById('gameSection').style.display = 'block';
  document.getElementById('roomCodeDisplay').textContent = code;
});

socket.on('updatePlayers', players => {
  const list = document.getElementById('playerList');
  list.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    list.appendChild(li);
  });
  if (players.length === 4) {
    document.getElementById('startBtn').style.display = 'inline-block';
  } else {
    document.getElementById('startBtn').style.display = 'none';
  }
});

socket.on('roleAssigned', role => {
  document.getElementById('role').textContent = `Tu rol: ${role}`;
});
