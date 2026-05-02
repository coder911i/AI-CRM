'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai-crm-iay1.onrender.com';
    const newSocket = io(apiUrl, {
      auth: { token: localStorage.getItem('waterting_token') },
      query: { tenantId: user.tenantId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      if (user) {
        newSocket.emit('join', { tenantId: user.tenantId });
        newSocket.emit('join-user', { userId: user.id });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, you need to reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
    });

    // Heartbeat tracking
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        const start = Date.now();
        newSocket.emit('ping', () => {
          const latency = Date.now() - start;
          // console.log(`Latency: ${latency}ms`);
        });
      }
    }, 30000);

    newSocket.on('lead:new', (lead) => {
      // Global toast or state update could go here
      console.log('New lead received:', lead);
    });

    newSocket.on('lead:scored', ({ leadId, score }) => {
      console.log(`Lead ${leadId} scored: ${score}`);
    });

    newSocket.on('lead:updated', (lead) => {
      console.log('Lead updated:', lead);
    });

    newSocket.on('unit:status', ({ unitId, status }) => {
      console.log(`Unit ${unitId} status: ${status}`);
    });

    newSocket.on('notification', (notif) => {
      // Global toast notification logic
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message });
      }
    });

    setSocket(newSocket);

    return () => {
      clearInterval(pingInterval);
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
