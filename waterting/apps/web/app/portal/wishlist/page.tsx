'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/wishlist')
      .then(setWishlist)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (id: string) => {
    try {
      await api.delete(`/portal/wishlist/${id}`);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>My Wishlist</h2>
          <p className="subtitle">Properties you are interested in</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {wishlist.map((item: any) => (
          <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 180, background: '#eee', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ background: '#fff', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                  <span style={{ color: 'var(--danger)' }}>❤️</span>
                </button>
              </div>
              {/* Image Placeholder */}
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 40 }}>🏠</div>
            </div>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{item.project?.name || item.property?.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{item.project?.location || item.property?.location}</p>
              
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 18 }}>
                  ₹{(item.project?.basePrice || item.property?.price || 0).toLocaleString()}
                </div>
                <div className="badge badge-info">
                  {item.project?.type || item.property?.type || 'Residential'}
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Contact Sales</button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlist.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>📑</div>
          <h3>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Start exploring projects and save your favorites here.</p>
          <Link href="/portal/dashboard" className="btn btn-primary" style={{ marginTop: 24 }}>Explore Projects</Link>
        </div>
      )}
    </div>
  );
}
