import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Hash, Target, Clock } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import GameLobby from './components/GameLobby';
import { serverUrl } from './config';

interface Player {
  id: string;
  name: string;
  isReady: boolean;
  guesses: number;
  guessesRemaining: number;
}

interface DigitResult {
  position: number;
  guessDigit: number;
  targetDigit: number;
  correct: boolean;
  hint: string;
}

interface GuessData {
  guesser: string;
  guesserId: string;
  target: string;
  targetId: string;
  guess: number;
  digitResults: DigitResult[];
  allCorrect: boolean;
  timestamp: number;
}

interface GameState {
  id: string;
  players: Player[];
  currentPlayer: string;
  gameStarted: boolean;
  gameEnded: boolean;
  winner: string | null;
  guessHistory: GuessData[];
  playerSecrets?: { [playerId: string]: number };
  creatorName?: string;
  maxGuesses?: number;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  // These are used in handleJoinGame but ESLint doesn't detect it
  const [playerName, setPlayerName] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const [showJoinForm, setShowJoinForm] = useState(true);
  
  const guessInputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(serverUrl);
    
    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from server');
    });

    newSocket.on('joined-game', ({ success, playerId: newPlayerId, gameState: newGameState, reason }) => {
      console.log('Joined game response:', { success, playerId: newPlayerId, gameState: newGameState, reason });
      if (success) {
        setPlayerId(newPlayerId);
        setGameState(newGameState);
        setShowJoinForm(false);
      } else {
        alert(`Failed to join game: ${reason}`);
      }
    });

    newSocket.on('game-updated', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    newSocket.on('guess-made', (guessData: GuessData) => {
      // Visual feedback for guess results
      console.log('Guess made:', guessData);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  // Focus guess input when it's the player's turn
  useEffect(() => {
    if (gameState?.gameStarted && gameState.currentPlayer === playerId && !gameState.gameEnded) {
      setTimeout(() => {
        guessInputRef.current?.focus();
      }, 100);
    }
  }, [gameState?.currentPlayer, gameState?.gameStarted, playerId, gameState?.gameEnded]);

  // Set default target when other players change
  useEffect(() => {
    if (gameState) {
      const otherPlayers = gameState.players.filter(p => p.id !== playerId);
      if (otherPlayers.length > 0 && !selectedTarget) {
        setSelectedTarget(otherPlayers[0].id);
      }
    }
  }, [gameState, playerId, selectedTarget]);



  const setSecret = () => {
    if (!socket || !secretNumber || secretNumber < 1000 || secretNumber > 9999) return;
    
    socket.emit('set-secret', { secretNumber });
  };

  // Get secret number from server state
  const getSecretNumber = () => {
    if (!gameState?.playerSecrets) return null;
    return gameState.playerSecrets[playerId] || null;
  };

  const makeGuess = () => {
    if (!socket || !currentGuess || !selectedTarget) return;
    
    const guess = parseInt(currentGuess);
    if (isNaN(guess) || guess < 1000 || guess > 9999) return;

    socket.emit('make-guess', { 
      targetPlayerId: selectedTarget, 
      guess
    });
    
    setCurrentGuess('');
  };

  const restartGame = () => {
    if (!socket) return;
    
    socket.emit('restart-game');
    setSecretNumber(null);
    setCurrentGuess('');
    setSelectedTarget('');
  };

  const handleJoinGame = (playerName: string, roomId: string) => {
    if (!socket) return;
    
    console.log('Joining game:', { playerName, roomId });
    setPlayerName(playerName);
    setGameId(roomId);
    setConnectionStatus('connecting');
    
    socket.emit('join-game', { 
      gameId: roomId, 
      playerName: playerName 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const currentPlayer = gameState?.players.find(p => p.id === playerId);
      if (!gameState?.gameStarted && !currentPlayer?.isReady && secretNumber !== null) {
        setSecret();
      } else if (gameState?.gameStarted && gameState.currentPlayer === playerId) {
        makeGuess();
      }
    }
  };

    // Show Game Lobby
  if (showJoinForm) {
    return (
      <GameLobby 
        onJoinGame={handleJoinGame}
        connectionStatus={connectionStatus}
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const otherPlayers = gameState.players.filter(p => p.id !== playerId);
  const isMyTurn = gameState.currentPlayer === playerId;
  
  // Set default target player (first other player)
  const defaultTarget = otherPlayers.length > 0 ? otherPlayers[0].id : '';

  // Secret Number Setup Screen
  if (!gameState.gameStarted && !currentPlayer?.isReady) {
    const serverSecretNumber = getSecretNumber();
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Hash className="mx-auto h-16 w-16 text-purple-600 mb-4" />
                         <h1 className="text-3xl font-bold text-gray-800 mb-2">Set Your Secret</h1>
             <p className="text-gray-600">Choose a 4-digit number between 1000-9999</p>
            <p className="text-sm text-gray-500 mt-2">
              Playing as: <span className="font-semibold text-purple-600">{currentPlayer?.name}</span>
            </p>
          </div>

          <div className="space-y-6">
                         <div>
                               <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Secret Number (1000-9999)
                </label>
               <input
                                   type="number"
                  min="1000"
                  max="9999"
                  value={secretNumber || ''}
                  onChange={(e) => setSecretNumber(parseInt(e.target.value) || null)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a 4-digit number"
                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-lg text-center font-mono"
                 autoFocus
               />
             </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Players in Room:</h3>
              <div className="space-y-2">
                {gameState.players.map(player => (
                  <div key={player.id} className="flex items-center justify-between">
                    <span className={`${player.id === playerId ? 'font-bold text-purple-600' : 'text-gray-700'}`}>
                      {player.name} {player.id === playerId && '(You)'}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      player.isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.isReady ? 'Ready' : 'Setting up...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

                         <button
               onClick={setSecret}
                               disabled={!secretNumber || secretNumber < 1000 || secretNumber > 9999}
               className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
             >
               Set Secret Number
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for Game to Start (only show if game hasn't started yet)
  if (!gameState.gameStarted && currentPlayer?.isReady && !gameState.players.every(p => p.isReady)) {
    const serverSecretNumber = getSecretNumber();
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Clock className="mx-auto h-16 w-16 text-yellow-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Waiting for Players</h1>
          <p className="text-gray-600 mb-6">
            Your secret number: <span className="font-bold text-2xl text-yellow-600">{serverSecretNumber}</span>
          </p>
          
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Player Status:</h3>
            <div className="space-y-2">
              {gameState.players.map(player => (
                <div key={player.id} className="flex items-center justify-between">
                  <span className={`${player.id === playerId ? 'font-bold text-yellow-600' : 'text-gray-700'}`}>
                    {player.name} {player.id === playerId && '(You)'}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    player.isReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Game will start when all players are ready...
          </p>
        </div>
      </div>
    );
  }

  // Win Screen
  if (gameState.gameEnded) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    const isWinner = gameState.winner === playerId;
    const serverSecretNumber = getSecretNumber();
    const isDraw = !gameState.winner;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Trophy className="mx-auto h-20 w-20 text-yellow-500 mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {isDraw ? 'Game Draw!' : (isWinner ? 'You Win!' : 'Game Over')}
          </h1>
          {isDraw ? (
            <p className="text-xl text-gray-600 mb-2">
              😔 All players ran out of guesses!
            </p>
          ) : (
            <p className="text-xl text-gray-600 mb-2">
              🎉 {winner?.name} guessed correctly! 🎉
            </p>
          )}
          <p className="text-gray-500 mb-8">
            Your secret number was: <span className="font-bold text-2xl text-green-600">{serverSecretNumber}</span>
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Final Stats:</h3>
              <div className="space-y-2">
                {gameState.players.map(player => (
                  <div key={player.id} className="flex justify-between">
                    <span className={player.id === playerId ? 'font-bold' : ''}>{player.name}</span>
                    <span>{player.guesses} guesses</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={restartGame}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

    // Main Game Screen
  const serverSecretNumber = getSecretNumber();
  

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Number Guessing Game</h1>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
              isMyTurn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Target className="mr-2 h-5 w-5" />
              {isMyTurn ? "Your Turn!" : `${gameState.players.find(p => p.id === gameState.currentPlayer)?.name}'s Turn`}
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Your Secret: </span>
              <span className="font-bold text-xl text-indigo-600">{serverSecretNumber}</span>
            </div>
          </div>
          
          {/* Room Info */}
          <div className="bg-white px-6 py-3 rounded-lg shadow mb-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <span className="text-gray-600">
                Room created by: <span className="font-semibold text-indigo-600">{gameState.creatorName || 'Unknown'}</span>
              </span>
              <span className="text-gray-600">
                Guesses per player: <span className="font-semibold text-indigo-600">{gameState.maxGuesses || 20}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Players Panel */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Players</h3>
            <div className="space-y-3">
              {gameState.players.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    player.id === gameState.currentPlayer
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                                     <div className="flex items-center justify-between">
                     <span className={`font-semibold ${
                       player.id === playerId ? 'text-indigo-600' : 'text-gray-700'
                     }`}>
                       {player.name} {player.id === playerId && '(You)'}
                     </span>
                     <div className="text-right">
                       <div className="text-sm text-gray-500">
                         {player.guesses} used / {player.guessesRemaining} left
                       </div>
                       <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                         <div 
                           className="bg-indigo-600 h-2 rounded-full transition-all"
                           style={{ width: `${(player.guesses / 20) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                   </div>
                  {player.id === gameState.currentPlayer && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      Currently guessing...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guess Input Panel */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Make Your Guess</h3>
            
                         {isMyTurn ? (
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Target Player
                   </label>
                   <select
                     value={selectedTarget}
                     onChange={(e) => setSelectedTarget(e.target.value)}
                     className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                   >
                     <option value="">Select a player to guess</option>
                     {otherPlayers.map(player => (
                       <option key={player.id} value={player.id}>
                         {player.name}
                       </option>
                     ))}
                   </select>
                 </div>

                                   <div>
                                         <label className="block text-sm font-medium text-gray-700 mb-2">
                       Your Guess (1000-9999)
                     </label>
                    <input
                      ref={guessInputRef}
                                             type="number"
                       min="1000"
                       max="9999"
                       value={currentGuess}
                       onChange={(e) => setCurrentGuess(e.target.value)}
                       onKeyPress={handleKeyPress}
                       placeholder="Enter a 4-digit number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-lg text-center font-mono"
                      disabled={!selectedTarget}
                    />
                  </div>

                  <button
                    onClick={makeGuess}
                                         disabled={!currentGuess || !selectedTarget || parseInt(currentGuess) < 1000 || parseInt(currentGuess) > 9999}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Guess Number
                  </button>
               </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Waiting for your turn...</p>
              </div>
            )}
          </div>
        </div>

        {/* Guess History */}
        {gameState.guessHistory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Guesses</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                                             {gameState.guessHistory.slice().reverse().map((guess, index) => {
                  const positionNames = ['Thousands', 'Hundreds', 'Tens', 'Ones'];
                 return (
                   <div
                     key={index}
                     className={`p-4 rounded-lg border-l-4 ${
                       guess.allCorrect
                         ? 'bg-green-50 border-green-400'
                         : guess.digitResults.some(r => r.correct)
                         ? 'bg-blue-50 border-blue-400'
                         : 'bg-red-50 border-red-400'
                     }`}
                   >
                     <div className="flex items-center justify-between mb-2">
                       <span className="font-semibold">
                         {guess.guesser} → {guess.target}: <span className="font-mono text-lg">{guess.guess}</span>
                       </span>
                       <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                         guess.allCorrect
                           ? 'bg-green-200 text-green-800'
                           : 'bg-blue-200 text-blue-800'
                       }`}>
                         {guess.allCorrect ? 'Correct!' : 'Partial Match'}
                       </span>
                     </div>
                     
                                           {/* Show digit-by-digit results */}
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {guess.digitResults.map((result, pos) => (
                          <div key={pos} className={`text-center p-2 rounded ${
                            result.correct ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <div className="text-xs font-medium">{positionNames[pos]}</div>
                            <div className="font-mono font-bold">{result.guessDigit}</div>
                            <div className="text-xs">
                              {result.correct ? '✓' : result.hint}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={restartGame}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
