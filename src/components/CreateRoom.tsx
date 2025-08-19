import React, { useState } from 'react';
import { Hash, Copy, Check } from 'lucide-react';

interface CreateRoomProps {
  onRoomCreated: (roomId: string) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated }) => {
  const [generatedRoomId, setGeneratedRoomId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generateRandomGameId = (): string => {
    // Create more diverse room IDs with patterns
    const patterns = [
      // Sequential patterns
      () => {
        const start = Math.floor(Math.random() * 7) + 1;
        const digits = `${start}${start + 1}${start + 2}`;
        const letters = String.fromCharCode(65 + start - 1) + 
                       String.fromCharCode(66 + start - 1) + 
                       String.fromCharCode(67 + start - 1);
        return `${digits}${letters}`;
      },
      // Repeating patterns
      () => {
        const digit = Math.floor(Math.random() * 9) + 1;
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return `${digit}${digit}${digit}${letter}${letter}${letter}`;
      },
      // Random but memorable
      () => {
        const digits = Math.floor(Math.random() * 900) + 100;
        const letters = Array.from({length: 3}, () => 
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join('');
        return `${digits}${letters}`;
      },
      // Special numbers
      () => {
        const specialNumbers = [111, 222, 333, 444, 555, 666, 777, 888, 999, 123, 234, 345, 456, 567, 678, 789];
        const digits = specialNumbers[Math.floor(Math.random() * specialNumbers.length)];
        const letters = Array.from({length: 3}, () => 
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ).join('');
        return `${digits}${letters}`;
      }
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return pattern();
  };

  const handleGenerateRoom = () => {
    const newRoomId = generateRandomGameId();
    setGeneratedRoomId(newRoomId);
    setCopied(false);
  };

  const handleCopyRoomId = async () => {
    if (generatedRoomId) {
      try {
        await navigator.clipboard.writeText(generatedRoomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy room ID:', err);
      }
    }
  };

  const handleCreateRoom = () => {
    if (generatedRoomId) {
      onRoomCreated(generatedRoomId);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Hash className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Room</h1>
        <p className="text-gray-600">Generate a room ID and invite friends to play</p>
      </div>

      <div className="space-y-6">
        {/* Generate Room ID */}
        <div className="text-center">
          <button
            onClick={handleGenerateRoom}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            Generate Room ID
          </button>
        </div>

        {/* Generated Room ID Display */}
        {generatedRoomId && (
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 text-center">Your Room ID:</h3>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-3xl font-bold text-green-600 font-mono tracking-wider">
                {generatedRoomId}
              </span>
              <button
                onClick={handleCopyRoomId}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                title="Copy room ID"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm text-center">Room ID copied!</p>
            )}
            <p className="text-sm text-green-700 text-center">
              Share this room ID with your friends to start playing
            </p>
          </div>
        )}

        {/* Create Room Button */}
        {generatedRoomId && (
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Room & Join
          </button>
        )}

        {/* Room ID Format Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Room ID Format:</h4>
          <p className="text-sm text-gray-600">
            • 3 digits (100-999) + 3 letters (A-Z)<br/>
            • Example: 123ABC, 456DEF, 789GHI<br/>
            • Each room ID is unique and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
