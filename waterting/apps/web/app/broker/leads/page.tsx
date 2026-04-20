'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Link from 'next/link';

export default function BrokerLeads() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    api.get('/broker-portal/leads').then(setLeads);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>My Assigned Leads</h2>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Property</th>
              <th>Status</th>
              <th>BHK Pref</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l: any) => (
              <tr key={l.id}>
                <td>{l.lead.name}</td>
                <td>{l.propertyId}</td>
                <td><span className="badge badge-info">{l.status}</span></td>
                <td>{l.lead.buyerPreference?.bhk || 'N/A'}</td>
                <td>₹{l.lead.buyerPreference?.budgetMax?.toLocaleString() || 'N/A'}</td>
                <td>
                  <Link href={`/broker/leads/${l.id}`} className="btn btn-secondary btn-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
