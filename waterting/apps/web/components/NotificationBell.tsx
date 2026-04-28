'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import { api } from '@/lib/api-client';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';

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

  const IconForType = ({ type }: { type: string }) => {
    switch (type) {
      case 'BOOKING': return <CheckCircle2 size={16} className="text-[var(--success)]" />;
      case 'STALE_LEAD': return <Clock size={16} className="text-[var(--warning)]" />;
      case 'ESCALATION': return <AlertTriangle size={16} className="text-[var(--danger)]" />;
      default: return <Info size={16} className="text-[var(--accent)]" />;
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} className="text-[var(--text-primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[var(--danger)] text-white w-5 h-5 text-[9px] flex items-center justify-center font-black border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-12 right-0 w-80 max-h-[480px] z-[1001] bg-[var(--bg-surface)] border-4 border-[var(--border)] shadow-[6px_6px_0px_0px_var(--border)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Signal Activity Core</span>
              <button 
                onClick={markAllRead}
                className="text-[10px] font-black text-[var(--accent)] bg-transparent border-0 cursor-pointer hover:underline uppercase tracking-tighter"
              >
                Flush Buffer
              </button>
            </div>
            
            <div className="overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest italic">
                   No anomalies detected.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markRead(n.id)}
                    className={`p-4 border-b border-[var(--border)] cursor-pointer transition-colors ${n.isRead ? 'bg-[var(--bg-surface)] opacity-60' : 'bg-[var(--accent-light)] border-l-4 border-l-[var(--accent)]'}`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-0.5"><IconForType type={n.type} /></div>
                      <div className="flex-1">
                        <div className="text-[12px] font-black text-[var(--text-primary)] leading-tight uppercase italic">{n.title}</div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-tight">{n.message}</div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-2 font-bold flex items-center gap-2 border-t border-[var(--border)] border-dashed pt-2 uppercase">
                          <Clock size={10} />
                          {new Date(n.createdAt).toLocaleDateString()} // {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-[var(--bg-elevated)] border-t border-[var(--border)] text-center">
               <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Protocol Version 1.0.4</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
