# Number Guessing Game

A multiplayer number guessing game built with React, TypeScript, and Socket.IO.

## Features

- Real-time multiplayer gameplay
- Room-based game sessions with unique room IDs (3 digits + 3 letters)
- Turn-based guessing mechanics
- Live game state updates
- Responsive design with Tailwind CSS
- Practice mode with default room IDs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start both the server and React app:
```bash
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the React app
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Play

### Creating a Room
1. Click "Create New Room" from the main lobby
2. Click "Generate Room ID" to create a unique room ID
3. Copy the room ID and share it with friends
4. Click "Create Room & Join" to enter the game

### Joining a Room
1. Click "Join Existing Room" from the main lobby
2. Enter your name and the room ID
3. Use practice room IDs (123ABC, 456DEF, 789GHI) for testing
4. Click "Join Room" to enter the game

### Game Rules
1. Each player sets a secret **4-digit number** (1000-9999)
2. **20 guesses per player** - use them wisely!
3. **Turn-based system** - players take turns guessing
4. **Default target** - first other player is automatically selected
5. Players guess **4 digits at once** (e.g., 1234, 5678, 9012)
6. The server checks each digit position and tells you which ones are correct
7. **Strategy**: Fix the correct digits and try different numbers for the remaining positions
8. **First player to guess the complete 4-digit number correctly wins!**
9. **If all players run out of guesses, the game ends in a draw**
10. **Example**: If you guess 1234 and the target is 1567, you'll see:
    - Thousands (1): ✓ Correct
    - Hundreds (2): Higher (should be 5)
    - Tens (3): Higher (should be 6)
    - Ones (4): Higher (should be 7)

## Technologies Used

- React 18
- TypeScript
- Socket.IO (Client & Server)
- Express.js
- Tailwind CSS
- Lucide React Icons

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── GameLobby.tsx      # Main lobby with create/join options
│   │   ├── CreateRoom.tsx     # Room creation component
│   │   └── JoinRoom.tsx       # Room joining component
│   ├── App.tsx                # Main game component
│   ├── index.tsx              # React entry point
│   └── index.css              # Tailwind CSS imports
├── server.js                  # Socket.IO game server
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Room ID Format

Room IDs follow the format: **3 digits + 3 letters**
- **Sequential**: 123ABC, 234DEF, 345GHI
- **Repeating**: 111AAA, 222BBB, 333CCC
- **Special**: 999XYZ, 888PQR, 777STU
- **Word-like**: 100FUN, 200GAM, 300PLY
- Each room ID is unique and secure
- Practice room IDs are provided for testing
- **Multiplayer Encouraged**: Diverse room IDs make it easy to find and join games

## Available Scripts

- `npm run dev`: Start both server and React app
- `npm run server`: Start only the Socket.IO server
- `npm start`: Start only the React app
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run deploy`: Build and deploy to Netlify (production)
- `npm run deploy:preview`: Build and deploy to Netlify (preview)

## Deployment

### Quick Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `build` folder
   - Or connect your GitHub repository

### Backend Deployment

The Socket.IO server needs to be deployed separately. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Recommended platforms:**
- Railway (railway.app)
- Render (render.com)
- Heroku (heroku.com)
- DigitalOcean App Platform
