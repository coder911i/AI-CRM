'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'ai' | 'user';
  content: string;
  properties?: any[];
}

export default function PortalChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<any>({});
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = [
    { key: 'budget', q: "Hi! I'm your Waterting property assistant. Let's find your perfect home. What's your budget range?" },
    { key: 'location', q: "Great! Which location are you looking in? (e.g., Noida, Gurgaon, South Delhi)" },
    { key: 'bhk', q: "How many BHKs are you looking for? (e.g. 2BHK, 3BHK, etc.)" },
    { key: 'purpose', q: "Is this for living in, investment, or renting?" },
    { key: 'amenities', q: "Any specific amenities you need? (e.g. Gym, Parking, Pool)" },
    { key: 'timeline', q: "What's your possession timeline? (e.g. 6 months, Ready to move)" }
  ];

  useEffect(() => {
    // Initial message
    setMessages([{ role: 'ai', content: questions[0].q }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const currentStep = step;
      const updatedPrefs = { ...prefs, [questions[currentStep].key]: userMsg };
      setPrefs(updatedPrefs);

      if (currentStep < questions.length - 1) {
        // Next question
        setStep(currentStep + 1);
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', content: questions[currentStep + 1].q }]);
          setLoading(false);
        }, 600);
      } else {
        // All gathered, match properties
        const res = await api.post('/portal/chatbot/buyer-chat', { preferences: updatedPrefs });
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: "I've found some great properties for you!", 
          properties: res.properties || [] 
        }]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleAction = async (propertyId: string, action: string) => {
    try {
      if (action === 'Schedule Visit' || action === "I'm Interested") {
        await api.post('/allocation/trigger', { 
           propertyId, 
           action: action === "Schedule Visit" ? "VISIT" : "INTEREST"
        });
        alert("We've notified the broker and owner. Visit slots will appear in your 'Deals' section shortly.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="crm-layout" style={{ height: '100vh', flexDirection: 'column' }}>
      <div className="page-header" style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
        <h2>AI Property Assistant</h2>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '24px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <div 
                className={m.role === 'user' ? 'card' : ''} 
                style={{ 
                  display: 'inline-block', 
                  padding: '12px 20px', 
                  borderRadius: '16px',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--card)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  maxWidth: '70%',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow)'
                }}
              >
                {m.content}
              </div>

              {m.properties && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {m.properties.map((p: any) => (
                    <div key={p.id} className="card" style={{ padding: 0 }}>
                      <div style={{ height: '160px', background: '#e5e7eb', borderRadius: '12px 12px 0 0' }}></div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h3 style={{ margin: 0 }}>{p.title}</h3>
                          <span className="badge badge-very-hot">{p.matchScore || '95%'} Match</span>
                        </div>
                        <p className="subtitle">{p.location}</p>
                        <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '8px 0' }}>₹{p.price?.toLocaleString()}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleAction(p.id, 'Schedule Visit')}>Visit</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleAction(p.id, "I'm Interested")}>Interested</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => window.open(`https://wa.me/${p.brokerPhone}`, '_blank')}>Contact</button>
                          <button className="btn btn-secondary btn-sm">Save</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="spinner" style={{ margin: '10px auto' }}></div>}
        </div>
      </div>

      <div style={{ padding: '24px 32px', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSend} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <input 
            className="form-input" 
            placeholder="Type your message..." 
            value={input} 
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  );
}
