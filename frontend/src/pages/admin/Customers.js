import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/customers`).then(r => setCustomers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <>
      <div className="adm-topbar">
        <div className="adm-page-title">Customers</div>
        <span style={{ fontSize: 13, color: 'var(--gray)' }}>{customers.length} total customers</span>
      </div>

      <div className="adm-stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Customers</div>
          <div className="adm-stat-value">{customers.length}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Revenue</div>
          <div className="adm-stat-value">${customers.reduce((s, c) => s + c.totalSpent, 0).toFixed(2)}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Avg per Customer</div>
          <div className="adm-stat-value">${customers.length ? (customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toFixed(2) : '0'}</div>
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontSize: 13 }}>{c.phone}</td>
                <td style={{ fontSize: 13, color: 'var(--gray)' }}>{c.email || '—'}</td>
                <td>{c.totalOrders}</td>
                <td style={{ fontWeight: 700 }}>${c.totalSpent.toFixed(2)}</td>
                <td style={{ color: 'var(--gray)', fontSize: 13 }}>{new Date(c.lastOrder).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No customers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
