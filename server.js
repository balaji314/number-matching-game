// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// ✅ Root route (fixes 404 on /)
app.get("/", (req, res) => {
  res.send("✅ Backend is running on port 3001");
});

// ✅ Games API
let games = [];
app.get("/games", (req, res) => {
  res.json({ availableGames: games });
});

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Create a new game
  socket.on("createGame", () => {
    const gameId = `game-${games.length + 1}`;
    games.push({ id: gameId, players: [socket.id] });
    socket.join(gameId);
    console.log(`🎮 Game created: ${gameId}`);
    io.to(socket.id).emit("gameCreated", { gameId });
  });

  // Join an existing game
  socket.on("joinGame", (gameId) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      game.players.push(socket.id);
      socket.join(gameId);
      console.log(`👥 Player joined ${gameId}`);
      io.to(gameId).emit("gameJoined", { gameId, players: game.players });
    } else {
      io.to(socket.id).emit("error", { message: "Game not found" });
    }
  });

  // Handle guesses
  socket.on("guessNumber", ({ gameId, guess }) => {
    console.log(`🎯 Guess in ${gameId}: ${guess}`);
    io.to(gameId).emit("guessMade", { player: socket.id, guess });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
