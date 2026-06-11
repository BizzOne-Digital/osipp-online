import { useState } from 'react';
import axios from 'axios';
import { ArrowIcon, SearchIcon, TruckIcon, MapPinIcon, CheckIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'picking', label: 'Picking Items' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function Tracking() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await axios.get(`${API}/orders/track/${orderId.trim()}`);
      setOrder(res.data.data);
    } catch {
      setError('Order not found. Please check the order ID and try again.');
    }
    setLoading(false);
  };

  const getStepStatus = (stepKey) => {
    if (!order) return 'pending';
    if (order.status === 'cancelled') return 'cancelled';
    const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
    const stepIdx = STATUS_STEPS.findIndex(s => s.key === stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) {
      // If delivered, mark as done (not active)
      if (order.status === 'delivered') return 'done';
      return 'active';
    }
    return 'upcoming';
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="section-header">
          <div className="section-title">Track Your Order</div>
          <div className="section-sub">Enter your order ID to check delivery status</div>
        </div>

        <div className="search-wrap" style={{ marginBottom: 32, boxShadow: 'none', border: '1.5px solid var(--gray-lt)', borderRadius: 'var(--r-md)' }}>
          <SearchIcon />
          <input className="search-input" placeholder="e.g. ORD-1001" value={orderId}
            onChange={e => setOrderId(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()} />
          <button className="btn-search" onClick={lookup} disabled={loading}>
            {loading ? 'Searching...' : 'Track'} <ArrowIcon />
          </button>
        </div>

        {error && <div className="empty-state"><div className="empty-state-title" style={{ color: 'var(--red)' }}>{error}</div></div>}

        {!order && !error && (
          <div className="empty-state">
            <div style={{ marginBottom: 8, opacity: 0.4 }}><TruckIcon /></div>
            <div style={{ fontSize: 14 }}>Enter an order ID above to track your delivery</div>
          </div>
        )}

        {order && (
          <div className="track-wrap fade-up">
            <div className="track-header">
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>{order.orderId}</div>
                <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPinIcon /> {order.customer.address}, {order.customer.city}
                </div>
              </div>
              <div className={`status-badge ${order.status}`}>{order.status.replace(/_/g, ' ')}</div>
            </div>

            {order.status === 'cancelled' ? (
              <div className="empty-state">
                <div className="empty-state-title" style={{ color: 'var(--red)' }}>Order Cancelled</div>
                <div className="empty-state-sub">{order.cancelReason || 'This order has been cancelled.'}</div>
              </div>
            ) : (
              STATUS_STEPS.map((s, i) => {
                const status = getStepStatus(s.key);
                return (
                  <div key={s.key} className="track-step">
                    {i < STATUS_STEPS.length - 1 && <div className={`track-line${status === 'done' ? ' done' : ''}`} />}
                    <div className={`track-dot${status === 'done' ? ' done' : status === 'active' ? ' active' : ''}`}>
                      {status === 'done' && <CheckIcon />}
                    </div>
                    <div>
                      <div className="track-title" style={{ color: status !== 'upcoming' ? 'var(--black)' : 'var(--gray)' }}>{s.label}</div>
                      <div className="track-time">
                        {status === 'done' && 'Completed'}
                        {status === 'active' && 'In progress...'}
                        {status === 'upcoming' && 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div style={{ marginTop: 24, padding: 16, background: 'var(--cream)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <strong>Total:</strong> ${order.total.toFixed(2)} &middot; <strong>Payment:</strong> {order.paymentMethod} &middot; <strong>Status:</strong> {order.paymentStatus}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
