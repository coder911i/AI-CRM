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
      case 'BOOKING': return <CheckCircle2 size={16} className="text-success" />;
      case 'STALE_LEAD': return <Clock size={16} className="text-warning" />;
      case 'ESCALATION': return <AlertTriangle size={16} className="text-danger" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-12 right-0 w-80 max-h-[480px] z-[1001] bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-bottom border-slate-100 bg-slate-50">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Center</span>
              <button 
                onClick={markAllRead}
                className="text-[11px] font-semibold text-primary bg-transparent border-0 cursor-pointer hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <div className="overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm italic">
                  Systems clear. No new alerts.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markRead(n.id)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${n.isRead ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5"><IconForType type={n.type} /></div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900 leading-tight">{n.title}</div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
