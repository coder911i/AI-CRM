'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';

export default function NotificationBell() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', { userId: user.id });
      socket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get<any[]>('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all', {});
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`, {});
      setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return '🟢';
      case 'STALE_LEAD': return '🟠';
      case 'ESCALATION': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="nav-icon" 
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: 14,
            height: 14,
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            border: '2px solid var(--card-bg)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div className="card shadow-lg" style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 320,
            maxHeight: 480,
            zIndex: 1001,
            overflowY: 'auto',
            padding: 0
          }}>
            <div className="card-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 16px',
              position: 'sticky',
              top: 0,
              background: 'var(--card-bg)',
              borderBottom: '1px solid var(--border)',
              zIndex: 1
            }}>
              <span style={{ fontWeight: 700 }}>Notifications</span>
              <button 
                onClick={markAllRead}
                style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            </div>
            
            <div style={{ padding: '8px 0' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: n.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{getIcon(n.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
