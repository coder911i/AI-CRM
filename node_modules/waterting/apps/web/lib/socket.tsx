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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(apiUrl, {
      auth: { token: localStorage.getItem('waterting_token') },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user) {
        newSocket.emit('join', { tenantId: user.tenantId });
        newSocket.emit('join-user', { userId: user.id });
      }
    });
    newSocket.on('disconnect', () => setIsConnected(false));

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
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
