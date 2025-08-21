const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Default route (for testing in browser)
app.get('/', (req, res) => {
  res.send("✅ Backend is running! Use Socket.IO for game events.");
});

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ["https://your-netlify-app.netlify.app", "http://localhost:3000"]
      : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Game state storage
const games = new Map();

// Helper function to generate random room ID
const generateRoomId = () => {
  const digits = Math.floor(Math.random() * 900) + 100;
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  return `${digits}${letters}`;
};

// Helper function to create a new game
const createGame = (roomId, creatorName) => {
  return {
    id: roomId,
    players: [],
    currentPlayer: null,
    gameStarted: false,
    gameEnded: false,
    winner: null,
    guessHistory: [],
    secrets: new Map(),       // playerId -> secret number
    playerSecrets: {},        // playerId -> secret number (for client)
    creatorName: creatorName, // Track who created the room
    maxGuesses: 20            // Maximum guesses per player
  };
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', ({ gameId, playerName }) => {
    console.log(`Player ${playerName} trying to join game ${gameId}`);
    let game = games.get(gameId);

    // If game doesn't exist, create it
    if (!game) {
      game = createGame(gameId, playerName);
      games.set(gameId, game);
      console.log(`Created new game: ${gameId} by ${playerName}`);
    }

    // Check if player name is already taken in this game
    const existingPlayer = game.players.find(p => p.name === playerName);
    if (existingPlayer) {
      socket.emit('joined-game', { success: false, reason: 'Player name already taken in this room' });
      return;
    }

    // Add player to game
    const player = {
      id: socket.id,
      name: playerName,
      isReady: false,
      guesses: 0,
      guessesRemaining: 20
    };
    game.players.push(player);

    // Join socket room
    socket.join(gameId);

    // Set current player if this is the first player
    if (game.players.length === 1) {
      game.currentPlayer = socket.id;
    }

    console.log(`Player ${playerName} joined game ${gameId}`);

    // Send success response
    socket.emit('joined-game', { success: true, playerId: socket.id, gameState: game });

    // Notify all players in the room
    io.to(gameId).emit('game-updated', game);
  });

  socket.on('set-secret', ({ secretNumber }) => {
    const game = Array.from(games.values()).find(g => g.players.some(p => p.id === socket.id));
    if (!game) return;

    if (secretNumber < 1000 || secretNumber > 9999) {
      socket.emit('error', { message: 'Secret number must be a 4-digit number (1000-9999)' });
      return;
    }

    game.secrets.set(socket.id, secretNumber);
    game.playerSecrets[socket.id] = secretNumber;

    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    const allReady = game.players.every(p => p.isReady);
    if (allReady && game.players.length >= 2) {
      game.gameStarted = true;
      console.log(`Game ${game.id} started!`);
    }

    io.to(game.id).emit('game-updated', game);
  });

  socket.on('make-guess', ({ targetPlayerId, guess }) => {
    const game = Array.from(games.values()).find(g => g.players.some(p => p.id === socket.id));
    if (!game || !game.gameStarted || game.gameEnded) return;

    const guesser = game.players.find(p => p.id === socket.id);
    const target = game.players.find(p => p.id === targetPlayerId);
    const targetSecret = game.secrets.get(targetPlayerId);
    if (!guesser || !target || targetSecret === undefined) return;

    if (game.currentPlayer !== socket.id) {
      socket.emit('error', { message: 'Not your turn!' });
      return;
    }

    if (guesser.guessesRemaining <= 0) {
      socket.emit('error', { message: 'No guesses remaining! Wait for your next turn.' });
      return;
    }

    if (guess < 1000 || guess > 9999) {
      socket.emit('error', { message: 'Guess must be a 4-digit number (1000-9999)' });
      return;
    }

    guesser.guesses++;
    guesser.guessesRemaining--;

    const guessDigits = [
      Math.floor(guess / 1000) % 10,
      Math.floor(guess / 100) % 10,
      Math.floor(guess / 10) % 10,
      guess % 10
    ];
    const targetDigits = [
      Math.floor(targetSecret / 1000) % 10,
      Math.floor(targetSecret / 100) % 10,
      Math.floor(targetSecret / 10) % 10,
      targetSecret % 10
    ];

    const digitResults = guessDigits.map((guessDigit, position) => ({
      position,
      guessDigit,
      targetDigit: targetDigits[position],
      correct: guessDigit === targetDigits[position],
      hint: guessDigit === targetDigits[position]
        ? 'Correct!'
        : (guessDigit < targetDigits[position] ? 'Higher' : 'Lower')
    }));

    const allCorrect = digitResults.every(result => result.correct);

    const guessData = {
      guesser: guesser.name,
      guesserId: guesser.id,
      target: target.name,
      targetId: target.id,
      guess,
      digitResults,
      allCorrect,
      timestamp: Date.now()
    };

    game.guessHistory.push(guessData);

    if (allCorrect) {
      game.gameEnded = true;
      game.winner = guesser.id;
      console.log(`Game ${game.id} ended! Winner: ${guesser.name}`);
    } else {
      const currentIndex = game.players.findIndex(p => p.id === game.currentPlayer);
      const nextIndex = (currentIndex + 1) % game.players.length;
      game.currentPlayer = game.players[nextIndex].id;

      const allPlayersOutOfGuesses = game.players.every(p => p.guessesRemaining <= 0);
      if (allPlayersOutOfGuesses) {
        game.gameEnded = true;
        game.winner = null;
        console.log(`Game ${game.id} ended in draw!`);
      }
    }

    io.to(game.id).emit('guess-made', guessData);
    io.to(game.id).emit('game-updated', game);
  });

  socket.on('restart-game', () => {
    const game = Array.from(games.values()).find(g => g.players.some(p => p.id === socket.id));
    if (!game) return;

    game.gameStarted = false;
    game.gameEnded = false;
    game.winner = null;
    game.guessHistory = [];
    game.secrets.clear();
    game.playerSecrets = {};

    game.players.forEach(player => {
      player.isReady = false;
      player.guesses = 0;
      player.guessesRemaining = 20;
    });

    if (game.players.length > 0) {
      game.currentPlayer = game.players[0].id;
    }

    console.log(`Game ${game.id} restarted`);
    io.to(game.id).emit('game-updated', game);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);

        if (game.players.length === 0) {
          games.delete(gameId);
          console.log(`Game ${gameId} removed (no players left)`);
        } else {
          if (game.currentPlayer === socket.id) {
            game.currentPlayer = game.players[0].id;
          }

          if (game.gameStarted) {
            game.gameStarted = false;
            game.gameEnded = false;
            game.winner = null;
            game.guessHistory = [];
            game.secrets.clear();
            game.players.forEach(p => {
              p.isReady = false;
              p.guesses = 0;
              p.guessesRemaining = 20;
            });
          }

          io.to(gameId).emit('game-updated', game);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
