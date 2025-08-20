# Number Guessing Game - Backend

Node.js/Express backend with Socket.IO for the multiplayer 4-digit number guessing game.

## Features

- **Express.js** server framework
- **Socket.IO** for real-time communication
- **CORS** configured for frontend connection
- **RESTful API** endpoints
- **In-memory game state** management

## Project Structure

```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── Procfile           # Deployment configuration
├── config.env         # Environment variables template
└── README.md          # This file
```

## Environment Variables

Copy `config.env` to `.env` and update values:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

For production:
```env
PORT=3001
FRONTEND_URL=https://your-frontend-domain.netlify.app
NODE_ENV=production
```

## API Endpoints

### REST Endpoints:

- **GET /health**
  ```json
  {
    "status": "OK",
    "message": "Number Guessing Game Backend is running",
    "activeGames": 0,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

- **GET /api/game-status**
  ```json
  {
    "totalGames": 2,
    "activeGames": ["123ABC", "456DEF"],
    "serverTime": "2024-01-01T00:00:00.000Z"
  }
  ```

### Socket.IO Events:

#### Client → Server:
- **join-game** `{ gameId, playerName }`
- **set-secret** `{ secretNumber }`
- **make-guess** `{ targetPlayerId, guess }`
- **restart-game** `{}`

#### Server → Client:
- **joined-game** `{ success, playerId?, gameState?, reason? }`
- **game-updated** `gameState`
- **guess-made** `guessData`
- **error** `{ message }`

## Game Logic

### Room ID Format:
- 3 digits + 3 letters (e.g., "123ABC")

### Secret Numbers:
- 4-digit numbers (1000-9999)

### Guessing System:
- Turn-based gameplay
- 20 guesses per player
- Digit-by-digit feedback:
  - **Correct**: Digit matches position
  - **Higher**: Target digit is higher
  - **Lower**: Target digit is lower

### Win Conditions:
- **Win**: All 4 digits guessed correctly
- **Draw**: All players run out of guesses

## Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev  # Uses nodemon for auto-restart
   # OR
   npm start    # Standard node start
   ```

## Deployment

### Railway Deployment:
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Render Deployment:
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set environment variables

### Heroku Deployment:
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy using Git

## CORS Configuration

The server is configured to accept connections from:
- `http://localhost:3000` (development)
- Your deployed frontend URL (production)

Update `FRONTEND_URL` environment variable for your deployed frontend.

## Game State Management

Games are stored in memory using a Map:
```javascript
const games = new Map(); // gameId -> gameState
```

Game state includes:
- Players list with stats
- Current turn player
- Game status (started/ended)
- Guess history
- Secret numbers
- Win/draw conditions

## Security Notes

- Input validation for all game data
- CORS properly configured
- No sensitive data exposed to clients
- Rate limiting can be added for production
