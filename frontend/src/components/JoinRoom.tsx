import React, { useState } from 'react';
import { Users, LogIn } from 'lucide-react';

interface JoinRoomProps {
  onJoinRoom: (playerName: string, roomId: string) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinRoom, connectionStatus }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [roomIdError, setRoomIdError] = useState<string>('');
  
  // Default room IDs for practice - more diverse and memorable
  const defaultRoomIds = [
    '123ABC', '456DEF', '789GHI',  // Sequential
    '111AAA', '222BBB', '333CCC',  // Repeating
    '999XYZ', '888PQR', '777STU',  // High numbers
    '100FUN', '200GAM', '300PLY'   // Word-like
  ];

  const validateRoomId = (id: string): boolean => {
    const roomIdPattern = /^\d{3}[A-Z]{3}$/;
    return roomIdPattern.test(id.toUpperCase());
  };

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRoomId(value);
    
    if (value.length > 0 && !validateRoomId(value)) {
      setRoomIdError('Room ID must be 3 digits followed by 3 letters (e.g., 123ABC)');
    } else {
      setRoomIdError('');
    }
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) return;
    
    if (!validateRoomId(roomId.trim())) {
      setRoomIdError('Please enter a valid room ID (3 digits + 3 letters)');
      return;
    }
    
    onJoinRoom(playerName.trim(), roomId.trim().toUpperCase());
  };

  const handleQuickSelect = (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    setRoomIdError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Users className="mx-auto h-16 w-16 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Game Room</h1>
        <p className="text-gray-600">Enter a room ID to join an existing game</p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Practice Mode:</strong> Use the default room IDs below for testing
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Player Name Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            maxLength={20}
          />
        </div>

        {/* Room ID Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={handleRoomIdChange}
            placeholder="Enter room ID (e.g., 123ABC)"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              roomIdError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            maxLength={6}
            style={{ textTransform: 'uppercase' }}
          />
          
          {/* Default Room IDs for Practice */}
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Quick Select (Practice Rooms):</p>
            <div className="flex flex-wrap gap-2">
              {defaultRoomIds.map((roomIdOption) => (
                <button
                  key={roomIdOption}
                  type="button"
                  onClick={() => handleQuickSelect(roomIdOption)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                    roomId === roomIdOption
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {roomIdOption}
                </button>
              ))}
            </div>
          </div>
          
          {roomIdError && (
            <p className="text-red-500 text-sm mt-1">{roomIdError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Format: 3 digits + 3 letters (e.g., 123ABC)
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinRoom}
          disabled={!playerName.trim() || !roomId.trim() || !validateRoomId(roomId.trim()) || connectionStatus !== 'connected'}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <LogIn className="h-5 w-5" />
          <span>Join Room</span>
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
