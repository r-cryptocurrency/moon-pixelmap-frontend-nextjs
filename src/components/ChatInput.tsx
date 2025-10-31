'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface ChatInputProps {
  className?: string;
}

export default function ChatInputArea({ className = '' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4321/ws/chat';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Send message via WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      text: message.trim(),
      address: isConnected ? address : null
    }));

    setMessage('');
  };

  return (
    <div className={`${className} panel p-3 h-auto`}>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={connected ? "Type your message..." : "Connecting..."}
          disabled={!connected}
          maxLength={500}
          className="flex-1 bg-gray-100 bg-opacity-70 rounded-md px-2 py-1 text-xs text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || !connected}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-1 text-xs rounded-md shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}