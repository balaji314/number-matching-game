import React, { useState } from 'react';
import { Gamepad2, Plus, LogIn } from 'lucide-react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';

interface GameLobbyProps {
  onJoinGame: (playerName: string, roomId: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

type LobbyView = 'main' | 'create' | 'join';

const GameLobby: React.FC<GameLobbyProps> = ({ onJoinGame, connectionStatus }) => {
  const [currentView, setCurrentView] = useState<LobbyView>('main');

  const handleRoomCreated = (roomId: string) => {
    // When a room is created, automatically join it
    onJoinGame('Host', roomId);
  };

  const handleJoinRoom = (playerName: string, roomId: string) => {
    onJoinGame(playerName, roomId);
  };

  const renderMainView = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Gamepad2 className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Number Guessing Game</h1>
        <p className="text-gray-600">Choose how you want to start playing</p>
      </div>

      <div className="space-y-4">
        {/* Create Room Button */}
        <button
          onClick={() => setCurrentView('create')}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-3 text-lg"
        >
          <Plus className="h-6 w-6" />
          <span>Create New Room</span>
        </button>

        {/* Join Room Button */}
        <button
          onClick={() => setCurrentView('join')}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3 text-lg"
        >
          <LogIn className="h-6 w-6" />
          <span>Join Existing Room</span>
        </button>

        {/* Connection Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-600">
              {connectionStatus === 'connected' ? 'Connected to server' : 
               connectionStatus === 'connecting' ? 'Connecting to server...' : 'Disconnected from server'}
            </span>
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2">How to Play:</h4>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Create a room and share the ID with friends</li>
            <li>• Each player sets a secret 4-digit number (1000-9999)</li>
            <li>• Take turns guessing other players' numbers</li>
            <li>• First to guess correctly wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <button
      onClick={() => setCurrentView('main')}
      className="mb-4 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-2 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Menu</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView !== 'main' && renderBackButton()}
        
        {currentView === 'main' && renderMainView()}
        {currentView === 'create' && <CreateRoom onRoomCreated={handleRoomCreated} />}
        {currentView === 'join' && (
          <JoinRoom 
            onJoinRoom={handleJoinRoom} 
            connectionStatus={connectionStatus} 
          />
        )}
      </div>
    </div>
  );
};

export default GameLobby;
