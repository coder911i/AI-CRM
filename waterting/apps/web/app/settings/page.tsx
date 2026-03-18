'use client';

import CRMLayout from '@/components/CRMLayout';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user && (user.role === 'TENANT_ADMIN' || user.role === 'SALES_MANAGER')) {
      api.get<any[]>('/users').then(setUsers).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <CRMLayout>
      <div className="page-header"><div><h2>Settings</h2><p className="subtitle">Manage your account and team</p></div></div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
        <div className="card">
          <div className="card-header">My Profile</div>
          <div style={{fontSize: 14}}>
            <p><strong>Email:</strong> {user?.email}</p>
            <p style={{marginTop: 8}}><strong>Role:</strong> {user?.role?.replace(/_/g, ' ')}</p>
            <p style={{marginTop: 8}}><strong>Tenant ID:</strong> <code style={{fontSize: 11}}>{user?.tenantId}</code></p>
          </div>
          <button className="btn btn-danger btn-sm" style={{marginTop: 16}} onClick={logout}>Logout</button>
        </div>

        {(user?.role === 'TENANT_ADMIN' || user?.role === 'SALES_MANAGER') && (
          <div className="card">
            <div className="card-header">Team Members</div>
            {users.map(u => (
              <div key={u.id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14}}>
                <div><strong>{u.name}</strong><br/><span style={{fontSize: 12, color: 'var(--text-muted)'}}>{u.email}</span></div>
                <span className="badge badge-info">{u.role?.replace(/_/g, ' ')}</span>
              </div>
            ))}
            {!users.length && <p style={{color: 'var(--text-muted)', fontSize: 13}}>No team members</p>}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
