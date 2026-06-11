import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const STATUSES = ['all', 'pending', 'confirmed', 'picking', 'out_for_delivery', 'delivered', 'cancelled'];
const NEXT_STATUS = { pending: 'confirmed', confirmed: 'picking', picking: 'out_for_delivery', out_for_delivery: 'delivered' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${API}/orders?status=${filter}&limit=50`)
      .then(r => setOrders(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status });
      fetchOrders();
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await axios.delete(`${API}/orders/${id}`); fetchOrders(); } catch { alert('Failed to delete'); }
  };

  return (
    <>
      <div className="adm-topbar">
        <div className="adm-page-title">Orders</div>
        <div className="topbar-right">
          <span style={{ fontSize: 13, color: 'var(--gray)' }}>{orders.length} orders</span>
        </div>
      </div>

      <div className="adm-filters">
        {STATUSES.map(s => (
          <button key={s} className={`adm-filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><span className="id-badge">{o.orderId}</span></td>
                  <td style={{ fontWeight: 500 }}>{o.customer.name}</td>
                  <td style={{ fontSize: 13 }}>{o.customer.phone}</td>
                  <td>{o.items.length}</td>
                  <td style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</td>
                  <td><span className={`badge ${o.paymentStatus}`}>{o.paymentMethod}</span></td>
                  <td><span className={`badge ${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="adm-btn-action" onClick={() => setSelected(o)}>View</button>
                      {NEXT_STATUS[o.status] && (
                        <button className="adm-btn adm-btn-gold adm-btn-sm" onClick={() => updateStatus(o._id, NEXT_STATUS[o.status])}>
                          {NEXT_STATUS[o.status].replace(/_/g, ' ')}
                        </button>
                      )}
                      {o.status !== 'cancelled' && o.status !== 'delivered' && (
                        <button className="adm-btn-danger" onClick={() => updateStatus(o._id, 'cancelled')}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <div className="adm-modal-title">{selected.orderId}</div>
              <button className="adm-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div className="form-label">Customer</div>
                  <div style={{ fontWeight: 600 }}>{selected.customer.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)' }}>{selected.customer.phone}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)' }}>{selected.customer.email}</div>
                </div>
                <div>
                  <div className="form-label">Delivery Address</div>
                  <div style={{ fontSize: 14 }}>{selected.customer.address}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)' }}>{selected.customer.city} {selected.customer.postalCode}</div>
                </div>
              </div>

              <div className="form-label">Items</div>
              <div style={{ background: 'var(--cream)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                {selected.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < selected.items.length - 1 ? '1px solid var(--gray-lt)' : 'none' }}>
                    <span>{item.name} x {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 8, borderTop: '1.5px solid var(--gray-lt)', fontWeight: 700, fontSize: 15 }}>
                  <span>Total</span><span>${selected.total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div><div className="form-label">Status</div><span className={`badge ${selected.status}`}>{selected.status.replace(/_/g, ' ')}</span></div>
                <div><div className="form-label">Payment</div><span>{selected.paymentMethod}</span></div>
                <div><div className="form-label">Date</div><span style={{ fontSize: 13 }}>{new Date(selected.createdAt).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="adm-modal-foot">
              {NEXT_STATUS[selected.status] && (
                <button className="adm-btn adm-btn-gold" onClick={() => updateStatus(selected._id, NEXT_STATUS[selected.status])}>
                  Move to: {NEXT_STATUS[selected.status].replace(/_/g, ' ')}
                </button>
              )}
              <button className="adm-btn-outline-s" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
