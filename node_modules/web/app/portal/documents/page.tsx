'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Doc {
  id: string;
  title: string;
  createdAt: string;
  metadata: { url?: string };
}

export default function PortalDocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/portal/documents')
      .then(setDocs)
      .catch(() => router.push('/portal/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: 20}}>My Documents</h2>
      <div className="card" style={{padding: 0}}>
        {docs.flatMap(b => b.documents).map((doc: any) => (
          <div key={doc.id} style={{padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <div style={{fontWeight: 600, fontSize: 14}}>{doc.title}</div>
              <div style={{fontSize: 12, color: 'var(--text-muted)'}}>{new Date(doc.createdAt).toLocaleDateString()}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.open(doc.metadata?.url, '_blank')}>
              Download
            </button>
          </div>
        ))}
        {docs.length === 0 && (
          <div style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)'}}>No documents available yet.</div>
        )}
      </div>
    </div>
  );
}
