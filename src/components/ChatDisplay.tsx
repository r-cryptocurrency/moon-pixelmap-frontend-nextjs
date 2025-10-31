'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string;
  user: string;
  fullAddress: string | null;
  message: string;
  timestamp: string;
}

export default function ChatDisplayArea({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4321/ws/chat';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'history') {
          // Receive message history on connect
          setMessages(data.messages);
        } else if (data.type === 'message') {
          // New message broadcast
          setMessages(prev => [...prev, data.data]);
        } else if (data.type === 'userCount') {
          setUserCount(data.count);
        } else if (data.type === 'error') {
          console.error('Chat error:', data.message);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${className} panel flex flex-col h-full max-h-full p-0`}>
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-300">
        <h3 className="font-semibold text-[11px]">Chat Display</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[10px] text-gray-600">{userCount} online</span>
        </div>
      </div>
      <div className="panel-content overflow-y-auto flex-1 px-1.5 py-0.5">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            No messages yet. Be the first to chat!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id} className={`py-0.5 ${index < messages.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="bg-gray-200 bg-opacity-60 rounded px-1.5 py-0.5 backdrop-blur-sm">
                <div className="flex items-start gap-1">
                  <span className="text-gray-600 text-[9px] whitespace-nowrap flex-shrink-0">
                    {formatTime(msg.timestamp)}
                  </span>
                  <span className={`text-xs font-bold font-mono flex-shrink-0 ${msg.fullAddress?.toLowerCase() === address?.toLowerCase() ? 'text-green-700' : 'text-blue-700'}`}>
                    {msg.user}:
                  </span>
                  <p className="text-gray-800 text-xs leading-tight break-words flex-1">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}