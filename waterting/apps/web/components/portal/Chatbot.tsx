'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! I am Waterting AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { response } = await api.post<any>('/portal/chatbot/message', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: '#fff', 
            border: 'none', cursor: 'pointer', fontSize: 28, boxShadow: '0 8px 24px rgba(0,87,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          💬
        </button>
      ) : (
        <div style={{
          width: 360, height: 500, background: '#fff', borderRadius: 20, boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)'
        }}>
          {/* Header */}
          <div style={{ background: 'var(--navy)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Waterting AI Concierge</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>&times;</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#F9FAFB' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%', padding: '10px 14px', borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                background: m.role === 'user' ? 'var(--primary)' : '#fff',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                boxShadow: m.role === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: m.role === 'bot' ? '1px solid var(--border)' : 'none'
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 16, background: '#eee', fontSize: 12 }}>
                AI is thinking...
              </div>
            )}
          </div>

          {/* Footer */}
          <form onSubmit={sendMessage} style={{ padding: 15, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button 
              type="submit" 
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0 15px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
