'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  user: string;
  fullAddress: string | null;
  message: string;
  timestamp: string;
}

interface ChatWebSocketContextType {
  messages: ChatMessage[];
  userCount: number;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  rateLimited: boolean;
  sendMessage: (text: string, address: string | null) => void;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType | null>(null);

// Reconnection configuration
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const RECONNECT_MULTIPLIER = 1.5;

interface ChatWebSocketProviderProps {
  children: ReactNode;
}

export function ChatWebSocketProvider({ children }: ChatWebSocketProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnecting(true);
    setError(null);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4321/ws/chat';
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setConnecting(false);
        setError(null);
        // Reset reconnect delay on successful connection
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'history') {
            setMessages(data.messages || []);
          } else if (data.type === 'message') {
            setMessages(prev => [...prev, data.data]);
          } else if (data.type === 'userCount') {
            setUserCount(data.count);
          } else if (data.type === 'error') {
            // Check for rate limit error
            if (data.message?.toLowerCase().includes('rate') || data.message?.toLowerCase().includes('limit')) {
              setRateLimited(true);
              // Clear rate limit after 5 seconds
              setTimeout(() => {
                if (mountedRef.current) setRateLimited(false);
              }, 5000);
            }
            setError(data.message);
            // Clear error after 5 seconds
            setTimeout(() => {
              if (mountedRef.current) setError(null);
            }, 5000);
          }
        } catch (err) {
          console.error('Error parsing chat message:', err);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        setConnecting(false);
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
        
        // Schedule reconnection with exponential backoff
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * RECONNECT_MULTIPLIER, MAX_RECONNECT_DELAY);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, delay);
      };
    } catch (err) {
      setConnecting(false);
      setError('Failed to connect to chat server');
    }
  }, []);

  const sendMessage = useCallback((text: string, address: string | null) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat');
      return;
    }

    if (rateLimited) {
      setError('You are sending messages too quickly. Please wait.');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      text: text.trim(),
      address
    }));
  }, [rateLimited]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return (
    <ChatWebSocketContext.Provider value={{
      messages,
      userCount,
      connected,
      connecting,
      error,
      rateLimited,
      sendMessage
    }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
}

export function useChatWebSocket() {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error('useChatWebSocket must be used within a ChatWebSocketProvider');
  }
  return context;
}
