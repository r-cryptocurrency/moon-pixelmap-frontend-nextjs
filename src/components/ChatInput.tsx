'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useChatWebSocket } from '@/context/ChatWebSocketContext';

interface ChatInputProps {
  className?: string;
}

export default function ChatInputArea({ className = '' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { connected, connecting, sendMessage, rateLimited } = useChatWebSocket();
  const { address, isConnected } = useAccount();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !connected || rateLimited) {
      return;
    }

    // Send message via shared WebSocket context
    sendMessage(message.trim(), isConnected ? address : undefined);
    setMessage('');
  };

  const getPlaceholder = () => {
    if (connecting) return "Connecting...";
    if (!connected) return "Reconnecting...";
    if (rateLimited) return "Please wait...";
    return "Type your message...";
  };

  return (
    <div className={`${className} panel p-3 h-auto`}>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={!connected || rateLimited}
          maxLength={500}
          className="flex-1 bg-gray-100 bg-opacity-70 rounded-md px-2 py-1 text-xs text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || !connected || rateLimited}
          className={`px-3 py-1 text-xs rounded-md shadow-md transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md ${
            rateLimited 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {rateLimited ? '⏱️' : 'Send'}
        </button>
      </form>
    </div>
  );
}