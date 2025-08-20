# Number Guessing Game - Frontend

React-based frontend for the multiplayer 4-digit number guessing game.

## Features

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **Lucide React** for icons
- **Component-based architecture**

## Project Structure

```
src/
├── components/
│   ├── CreateRoom.tsx    # Room creation component
│   ├── JoinRoom.tsx      # Room joining component
│   └── GameLobby.tsx     # Main lobby component
├── App.tsx               # Main application component
├── config.ts             # Environment configuration
├── index.tsx             # Application entry point
└── index.css             # Global styles
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_SERVER_URL=http://localhost:3001
```

For production, set `REACT_APP_SERVER_URL` to your deployed backend URL.

## Development Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## API Connection

The frontend connects to the backend using:
- **Socket.IO** for real-time game communication
- **REST endpoints** for health checks and status

### Key Connection Points:

1. **Socket Connection:**
   ```typescript
   import { serverUrl } from './config';
   const socket = io(serverUrl);
   ```

2. **Game Events:**
   - `join-game` - Join a game room
   - `set-secret` - Set player's secret number
   - `make-guess` - Make a guess
   - `restart-game` - Restart the game

## Deployment

### Netlify Deployment:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npm run deploy
   ```

3. **Set environment variables in Netlify:**
   - `REACT_APP_SERVER_URL` = Your backend server URL

## Game Flow

1. **Lobby** → Choose create or join room
2. **Room Setup** → Enter room ID and player name
3. **Secret Setup** → Set 4-digit secret number (1000-9999)
4. **Game Play** → Take turns guessing other players' numbers
5. **Results** → View digit-by-digit feedback and win/draw conditions

## Configuration

The `src/config.ts` file handles environment-specific URLs:

```typescript
export const serverUrl = config[environment].serverUrl;
export const API_ENDPOINTS = {
  SOCKET_CONNECTION: serverUrl,
  HEALTH_CHECK: `${serverUrl}/health`,
  GAME_STATUS: `${serverUrl}/api/game-status`
};
```
