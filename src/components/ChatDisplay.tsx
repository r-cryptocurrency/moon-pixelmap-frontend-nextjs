'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useChatWebSocket } from '@/context/ChatWebSocketContext';

export default function ChatDisplayArea({ className = '' }: { className?: string }) {
  const { messages, userCount, connected, connecting, error, rateLimited } = useChatWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionStatus = () => {
    if (connecting) return { color: 'bg-yellow-500', text: 'Connecting...' };
    if (connected) return { color: 'bg-green-500', text: `${userCount} online` };
    return { color: 'bg-red-500', text: 'Reconnecting...' };
  };

  const status = getConnectionStatus();

  return (
    <div className={`${className} panel flex flex-col h-full max-h-full p-0`}>
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-300">
        <h3 className="font-semibold text-[11px]">Chat Display</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.color} ${connecting ? 'animate-pulse' : ''}`}></div>
          <span className="text-[10px] text-gray-600">{status.text}</span>
        </div>
      </div>
      
      {/* Error/Rate limit banner */}
      {(error || rateLimited) && (
        <div className={`px-3 py-1 text-[10px] ${rateLimited ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {rateLimited ? '⏱️ Sending too fast - please wait' : `⚠️ ${error}`}
        </div>
      )}
      
      <div className="panel-content overflow-y-auto flex-1 px-1.5 py-0.5">
        {!connected && !connecting && (
          <div className="text-center text-gray-500 text-xs py-4">
            <div className="mb-2">🔌</div>
            <p>Disconnected from chat</p>
            <p className="text-[10px] mt-1">Reconnecting automatically...</p>
          </div>
        )}
        
        {connecting && messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500 mx-auto mb-2"></div>
            <p>Connecting to chat...</p>
          </div>
        )}
        
        {connected && messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            No messages yet. Be the first to chat!
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={msg.id} className={`py-1 ${index < messages.length - 1 ? 'border-b border-gray-200' : ''}`}>
            <div className="bg-gray-200 bg-opacity-60 rounded px-2 py-1 backdrop-blur-sm">
              <div className="text-xs leading-relaxed">
                <span style={{ color: '#6B7280', marginRight: '8px' }}>
                  {formatTime(msg.timestamp)}
                </span>
                <span 
                  style={{ 
                    fontWeight: 'bold', 
                    fontFamily: 'monospace',
                    color: msg.fullAddress?.toLowerCase() === address?.toLowerCase() ? '#15803d' : '#1d4ed8',
                    marginRight: '4px'
                  }}
                >
                  {msg.user}:
                </span>
                <span style={{ color: '#1f2937' }}>{msg.message}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}