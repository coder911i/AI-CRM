'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function MyProperties() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    api.get('/owner/properties').then(setProperties);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>My Properties</h2>
        <button className="btn btn-primary">+ Add Property</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Location</th>
              <th>Status</th>
              <th>Visits</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p: any) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.type}</td>
                <td>₹{p.price.toLocaleString()}</td>
                <td>{p.location}</td>
                <td><span className={`badge ${p.status === 'AVAILABLE' ? 'badge-success' : 'badge-cold'}`}>{p.status}</span></td>
                <td>{p._count.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
