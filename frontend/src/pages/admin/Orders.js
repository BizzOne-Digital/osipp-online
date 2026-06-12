import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const STATUSES = ['all', 'pending', 'confirmed', 'picking', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_FLOW = ['pending', 'confirmed', 'picking', 'out_for_delivery', 'delivered'];
const NEXT_STATUS = { pending: 'confirmed', confirmed: 'picking', picking: 'out_for_delivery', out_for_delivery: 'delivered' };
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', picking: 'Picking Items', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_COLORS = { pending: '#856404', confirmed: '#0C5460', picking: '#383D6B', out_for_delivery: '#E65100', delivered: '#155724', cancelled: '#721C24' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${API}/orders?status=${filter}&limit=100`)
      .then(r => setOrders(r.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status });
      fetchOrders();
      if (selected && selected._id === id) {
        setSelected(prev => ({ ...prev, status }));
      }
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try { await axios.delete(`${API}/orders/${id}`); fetchOrders(); setSelected(null); } catch { alert('Failed'); }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.orderId?.toLowerCase().includes(s) || o.customer?.name?.toLowerCase().includes(s) || o.customer?.phone?.includes(s);
  });

  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const getStepStatus = (order, stepKey) => {
    if (order.status === 'cancelled') return 'cancelled';
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    const stepIdx = STATUS_FLOW.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return order.status === 'delivered' ? 'done' : 'active';
    return 'upcoming';
  };

  return (
    <>
      <div className="adm-topbar">
        <div>
          <div className="adm-page-title">Orders</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{orders.length} total orders</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, customer..."
          style={{ padding: '10px 16px', border: '1.5px solid var(--gray-lt)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white', width: 260 }} />
      </div>

      {/* Status summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {['pending', 'confirmed', 'picking', 'out_for_delivery', 'delivered'].map(s => (
          <div key={s} onClick={() => setFilter(s === filter ? 'all' : s)}
            style={{ padding: '12px 14px', background: filter === s ? 'var(--black)' : 'white', color: filter === s ? 'white' : 'var(--black)', borderRadius: 10, cursor: 'pointer', textAlign: 'center', border: '1.5px solid var(--gray-lt)', transition: 'all .2s' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-d)' }}>{statusCounts[s] || 0}</div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, opacity: 0.7 }}>{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      <div className="adm-filters">
        {STATUSES.map(s => (
          <button key={s} className={`adm-filter-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : STATUS_LABELS[s]} {s !== 'all' && statusCounts[s] ? `(${statusCounts[s]})` : ''}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} onClick={() => setSelected(o)} style={{ cursor: 'pointer' }}>
                  <td><span className="id-badge">{o.orderId}</span></td>
                  <td style={{ fontWeight: 500 }}>{o.customer?.name}</td>
                  <td style={{ fontSize: 13 }}>{o.customer?.phone}</td>
                  <td>{(o.items || []).length}</td>
                  <td style={{ fontWeight: 700 }}>${(o.total || 0).toFixed(2)}</td>
                  <td style={{ fontSize: 12 }}>{o.paymentMethod}</td>
                  <td><span className={`badge ${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                  <td style={{ color: 'var(--gray)', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {NEXT_STATUS[o.status] && (
                        <button className="adm-btn adm-btn-gold adm-btn-sm" onClick={() => updateStatus(o._id, NEXT_STATUS[o.status])} style={{ fontSize: 10, padding: '3px 8px' }}>
                          → {STATUS_LABELS[NEXT_STATUS[o.status]]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No orders</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Detail / Tracking Modal ── */}
      {selected && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="adm-modal" style={{ maxWidth: 640 }}>
            <div className="adm-modal-head">
              <div>
                <div className="adm-modal-title">{selected.orderId}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <button className="adm-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

              {/* ── Status Timeline ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray)', marginBottom: 14 }}>Order Tracking</div>
                {selected.status === 'cancelled' ? (
                  <div style={{ background: '#FFF0F0', border: '1px solid #FCC', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>Order Cancelled</div>
                    <div style={{ fontSize: 13, color: 'var(--gray)' }}>{selected.cancelReason || 'No reason provided'}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {STATUS_FLOW.map((s, i) => {
                      const st = getStepStatus(selected, s);
                      return (
                        <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: st === 'done' ? 'var(--green)' : st === 'active' ? 'var(--gold)' : 'var(--gray-lt)',
                            color: st !== 'upcoming' ? 'white' : 'var(--gray)',
                            fontSize: 13, fontWeight: 700, transition: 'all .3s'
                          }}>
                            {st === 'done' ? '✓' : i + 1}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: st !== 'upcoming' ? 'var(--black)' : 'var(--gray)', lineHeight: 1.3 }}>
                            {STATUS_LABELS[s]}
                          </div>
                          {i < STATUS_FLOW.length - 1 && (
                            <div style={{ height: 2, background: st === 'done' ? 'var(--green)' : 'var(--gray-lt)', margin: '-20px auto 0', width: '100%', position: 'relative', top: -20, zIndex: -1 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick status buttons */}
                {selected.status !== 'delivered' && selected.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {NEXT_STATUS[selected.status] && (
                      <button className="adm-btn adm-btn-gold" onClick={() => updateStatus(selected._id, NEXT_STATUS[selected.status])}>
                        Move to: {STATUS_LABELS[NEXT_STATUS[selected.status]]}
                      </button>
                    )}
                    <button className="adm-btn-danger" style={{ padding: '8px 16px' }} onClick={() => updateStatus(selected._id, 'cancelled')}>
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>

              {/* ── Customer Info ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray)', marginBottom: 10 }}>Customer</div>
                <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.customer?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>{selected.customer?.email || 'No email'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <a href={`tel:${selected.customer?.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'white', border: '1px solid var(--gray-lt)', borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'var(--black)', textDecoration: 'none', marginBottom: 6 }}>
                        📞 {selected.customer?.phone}
                      </a>
                      <br />
                      <a href={`https://wa.me/${(selected.customer?.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#25D366', borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'white', textDecoration: 'none' }}>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-lt)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', marginBottom: 4 }}>DELIVERY ADDRESS</div>
                    <div style={{ fontSize: 14 }}>{selected.customer?.address}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray)' }}>{selected.customer?.city} {selected.customer?.postalCode}</div>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent((selected.customer?.address || '') + ' ' + (selected.customer?.city || ''))}`}
                      target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--gold-dk)', textDecoration: 'underline' }}>
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>

              {/* ── Order Items ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray)', marginBottom: 10 }}>
                  Items ({(selected.items || []).length})
                </div>
                <div style={{ background: 'white', border: '1px solid var(--gray-lt)', borderRadius: 10, overflow: 'hidden' }}>
                  {(selected.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < selected.items.length - 1 ? '1px solid var(--gray-lt)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray)' }}>{item.volume} &middot; Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Payment Summary ── */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray)', marginBottom: 10 }}>Payment</div>
                <div style={{ background: 'var(--cream)', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>Subtotal</span><span>${(selected.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {(selected.discount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--green)' }}>
                      <span>Discount {selected.couponCode ? `(${selected.couponCode})` : ''}</span><span>-${selected.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>Delivery</span><span>${(selected.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 10, borderTop: '1.5px solid var(--gray-lt)', marginTop: 8 }}>
                    <span>Total</span><span style={{ color: 'var(--gold-dk)' }}>${(selected.total || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <div style={{ fontSize: 12 }}><span style={{ color: 'var(--gray)' }}>Method:</span> <strong>{selected.paymentMethod}</strong></div>
                    <div style={{ fontSize: 12 }}><span style={{ color: 'var(--gray)' }}>Status:</span> <strong>{selected.paymentStatus}</strong></div>
                  </div>
                  {selected.notes && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--gray-lt)', fontSize: 13 }}>
                      <span style={{ color: 'var(--gray)' }}>Notes:</span> {selected.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="adm-modal-foot" style={{ justifyContent: 'space-between' }}>
              <button className="adm-btn-danger" style={{ padding: '8px 16px' }} onClick={() => deleteOrder(selected._id)}>Delete Order</button>
              <button className="adm-btn-outline-s" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}