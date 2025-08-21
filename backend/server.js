// Load environment variables
require('dotenv').config({ path: './config.env' });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// CORS configuration for frontend-backend communication
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || "https://your-frontend-domain.netlify.app",
        "http://localhost:3000"
      ]
    : "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL || "https://your-frontend-domain.netlify.app",
          "http://localhost:3000"
        ]
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Game state storage
const games = new Map();

// API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Number Guessing Game Backend is running',
    activeGames: games.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/game-status', (req, res) => {
  const gamesList = Array.from(games.keys());
  res.json({
    totalGames: games.size,
    activeGames: gamesList,
    serverTime: new Date().toISOString()
  });
});

// Helper function to generate random room ID (3 digits + 3 letters)
const generateRoomId = () => {
  const digits = Math.floor(Math.random() * 900) + 100;
  const letters = Array.from({length: 3}, () => 
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
    secrets: new Map(), // playerId -> secret number
    playerSecrets: {}, // playerId -> secret number (for client)
    creatorName: creatorName, // Track who created the room
    maxGuesses: 20 // Maximum guesses per player
  };
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a game
  socket.on('join-game', ({ gameId, playerName }) => {
    console.log(`Player ${playerName} trying to join game ${gameId}`);
    
    // Check if player name is provided
    if (!playerName || !playerName.trim()) {
      socket.emit('joined-game', { 
        success: false, 
        reason: 'Player name is required' 
      });
      return;
    }

    // Get or create game
    let game = games.get(gameId);
    if (!game) {
      console.log(`Created new game: ${gameId}`);
      game = createGame(gameId, playerName);
      games.set(gameId, game);
    }

    // Check if player name already exists in this game
    const existingPlayer = game.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (existingPlayer) {
      socket.emit('joined-game', { 
        success: false, 
        reason: 'Player name already taken in this game' 
      });
      return;
    }

    // Add player to game
    const player = {
      id: socket.id,
      name: playerName,
      isReady: false,
      guesses: 0,
      guessesRemaining: game.maxGuesses
    };

    game.players.push(player);
    socket.join(gameId);

    // Set first player as current player if none set
    if (!game.currentPlayer) {
      game.currentPlayer = socket.id;
    }

    console.log(`Player ${playerName} joined game ${gameId}`);
    
    socket.emit('joined-game', { 
      success: true, 
      playerId: socket.id, 
      gameState: game 
    });
    
    // Notify all players in the game
    io.to(gameId).emit('game-updated', game);
  });

  // Handle setting secret number
  socket.on('set-secret', ({ secretNumber }) => {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);
    const game = games.get(gameId);
    
    if (!game) return;

    // Validate secret number (4-digit: 1000-9999)
    if (!secretNumber || secretNumber < 1000 || secretNumber > 9999) {
      socket.emit('error', { message: 'Secret number must be between 1000-9999' });
      return;
    }

    // Store secret
    game.secrets.set(socket.id, secretNumber);
    game.playerSecrets[socket.id] = secretNumber;

    // Mark player as ready
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    // Check if all players are ready and we have at least 2 players
    const allReady = game.players.length >= 2 && game.players.every(p => p.isReady);
    if (allReady && !game.gameStarted) {
      game.gameStarted = true;
      console.log(`Game ${gameId} started!`);
    }

    io.to(gameId).emit('game-updated', game);
  });

  // Handle making a guess
  socket.on('make-guess', ({ targetPlayerId, guess }) => {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);
    const game = games.get(gameId);
    
    if (!game || !game.gameStarted || game.gameEnded) return;

    // Check if it's the player's turn
    if (game.currentPlayer !== socket.id) {
      socket.emit('error', { message: 'Not your turn!' });
      return;
    }

    // Check if player has guesses remaining
    const currentPlayer = game.players.find(p => p.id === socket.id);
    if (!currentPlayer || currentPlayer.guessesRemaining <= 0) {
      socket.emit('error', { message: 'No guesses remaining!' });
      return;
    }

    // Validate guess (4-digit: 1000-9999)
    if (!guess || guess < 1000 || guess > 9999) {
      socket.emit('error', { message: 'Guess must be a 4-digit number (1000-9999)' });
      return;
    }

    const targetSecret = game.secrets.get(targetPlayerId);
    if (!targetSecret) {
      socket.emit('error', { message: 'Target player not found or secret not set' });
      return;
    }

    // Update player stats
    currentPlayer.guesses++;
    currentPlayer.guessesRemaining--;

    // Convert to 4-digit arrays for comparison
    const guessDigits = guess.toString().padStart(4, '0').split('').map(Number);
    const targetDigits = targetSecret.toString().padStart(4, '0').split('').map(Number);

    // Calculate digit-by-digit results
    const digitResults = guessDigits.map((digit, index) => ({
      position: index,
      guessDigit: digit,
      targetDigit: targetDigits[index],
      correct: digit === targetDigits[index],
      hint: digit === targetDigits[index] ? 'Correct' : 
            digit < targetDigits[index] ? 'Higher' : 'Lower'
    }));

    const allCorrect = digitResults.every(result => result.correct);

    // Create guess data
    const guessData = {
      guesser: currentPlayer.name,
      guesserId: socket.id,
      target: game.players.find(p => p.id === targetPlayerId)?.name || 'Unknown',
      targetId: targetPlayerId,
      guess: guess,
      digitResults: digitResults,
      allCorrect: allCorrect,
      timestamp: Date.now()
    };

    game.guessHistory.push(guessData);

    // Check for win
    if (allCorrect) {
      game.gameEnded = true;
      game.winner = socket.id;
    } else {
      // Move to next player
      const currentIndex = game.players.findIndex(p => p.id === game.currentPlayer);
      const nextIndex = (currentIndex + 1) % game.players.length;
      game.currentPlayer = game.players[nextIndex].id;

      // Check if all players are out of guesses (draw condition)
      const playersWithGuesses = game.players.filter(p => p.guessesRemaining > 0);
      if (playersWithGuesses.length === 0) {
        game.gameEnded = true;
        game.winner = null; // Draw
      }
    }

    io.to(gameId).emit('game-updated', game);
    io.to(gameId).emit('guess-made', guessData);
  });

  // Handle game restart
  socket.on('restart-game', () => {
    const gameId = Array.from(socket.rooms).find(room => room !== socket.id);
    const game = games.get(gameId);
    
    if (!game) return;

    // Reset game state
    game.gameStarted = false;
    game.gameEnded = false;
    game.winner = null;
    game.guessHistory = [];
    game.secrets.clear();
    game.playerSecrets = {};
    game.currentPlayer = game.players[0]?.id || null;

    // Reset all players
    game.players.forEach(player => {
      player.isReady = false;
      player.guesses = 0;
      player.guessesRemaining = game.maxGuesses;
    });

    io.to(gameId).emit('game-updated', game);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up games
    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        game.secrets.delete(socket.id);
        delete game.playerSecrets[socket.id];

        if (game.players.length === 0) {
          games.delete(gameId);
          console.log(`Game ${gameId} removed (no players left)`);
        } else {
          // If current player left, move to next player
          if (game.currentPlayer === socket.id) {
            game.currentPlayer = game.players[0].id;
          }
          
          // If game was in progress, reset it
          if (game.gameStarted && !game.gameEnded) {
            game.gameStarted = false;
            game.gameEnded = false;
            game.players.forEach(player => {
              player.isReady = false;
              player.guesses = 0;
              player.guessesRemaining = game.maxGuesses;
            });
          }
          
          io.to(gameId).emit('game-updated', game);
        }
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available games: ${games.size}`);
});