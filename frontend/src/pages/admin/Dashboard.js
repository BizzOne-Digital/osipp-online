import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/dashboard`).then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!data) return <div className="empty">Failed to load dashboard data</div>;

  return (
    <>
      <div className="adm-topbar">
        <div className="adm-page-title">Dashboard</div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>Welcome back, Admin</span>
        </div>
      </div>

      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-label">Today's Revenue</div>
          <div className="adm-stat-value">${data.todayRevenue.toFixed(2)}</div>
          <div className="adm-stat-sub">{data.todayOrders} orders today</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Total Orders</div>
          <div className="adm-stat-value">{data.totalOrders}</div>
          <div className="adm-stat-sub">Avg ${data.avgOrderValue?.toFixed(2) || '0'} per order</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Pending Orders</div>
          <div className="adm-stat-value">{data.pendingOrders}</div>
          <div className={`stat-sub${data.pendingOrders > 5 ? ' bad' : ' warn'}`}>
            {data.pendingOrders > 0 ? 'Needs attention' : 'All caught up'}
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-label">Products</div>
          <div className="adm-stat-value">{data.totalProducts}</div>
          <div className={`stat-sub${data.lowStock > 0 ? ' warn' : ''}`}>{data.lowStock} low stock</div>
        </div>
      </div>

      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <div className="adm-table-title">Recent Orders</div>
          <button className="adm-btn-outline-s" onClick={() => navigate('/admin/orders')}>View All</button>
        </div>
        <table className="adm-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data.recentOrders.map(o => (
              <tr key={o._id}>
                <td><span className="id-badge">{o.orderId}</span></td>
                <td style={{ fontWeight: 500 }}>{o.customer.name}</td>
                <td>{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</td>
                <td><span className={`badge ${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                <td style={{ color: 'var(--gray)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.recentOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray)', padding: 40 }}>No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
