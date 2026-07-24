import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const KINDS = ['all', 'grocery', 'membership', 'gift'];
const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const KIND_LABEL = { grocery: 'Grocery', membership: 'Membership', gift: 'Gift' };

export default function Services() {
  const [rows, setRows] = useState([]);
  const [kind, setKind] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    axios.get(`${API}/services?kind=${kind}&limit=100`)
      .then(r => setRows(r.data?.data || []))
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchRows(); }, [kind]);

  const setStatus = async (id, status) => {
    try {
      await axios.put(`${API}/services/${id}/status`, { status });
      fetchRows();
      if (selected && selected._id === id) setSelected(p => ({ ...p, status }));
    } catch { alert('Failed'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try { await axios.delete(`${API}/services/${id}`); fetchRows(); setSelected(null); } catch { alert('Failed'); }
  };
  const cancelSubscription = async (id) => {
    if (!window.confirm('Cancel this auto-renew subscription in Stripe? The customer will not be billed again.')) return;
    try {
      const res = await axios.put(`${API}/services/${id}/cancel-subscription`);
      fetchRows();
      if (selected && selected._id === id) setSelected(res.data.data);
    } catch (err) { alert(err.response?.data?.message || 'Failed to cancel'); }
  };

  return (
    <>
      <div className="adm-topbar">
        <div><div className="adm-page-title">Service Requests</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{rows.length} requests · grocery, memberships & gifts</div></div>
      </div>

      <div className="adm-filters" style={{ marginBottom: 16 }}>
        {KINDS.map(k => <button key={k} className={`adm-filter-pill${kind === k ? ' active' : ''}`} onClick={() => setKind(k)}>{k === 'all' ? 'All' : KIND_LABEL[k]}</button>)}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>ID</th><th>Type</th><th>Customer</th><th>Phone</th><th>Details</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                  <td><span className="id-badge">{r.requestId}</span></td>
                  <td style={{ fontSize: 12 }}>{KIND_LABEL[r.kind]}{r.groceryType ? ` · ${r.groceryType}` : ''}{r.plan ? ` · ${r.plan}` : ''}{r.planName ? ` · ${r.planName}` : ''}</td>
                  <td style={{ fontWeight: 500 }}>{r.customer?.name}</td>
                  <td style={{ fontSize: 13 }}>{r.customer?.phone}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.planCode
                      ? `$${r.planPrice}/mo · ${r.billingType === 'auto-renew' ? 'Auto-Renew' : 'Manual'} · ${r.paymentStatus}${r.subscriptionStatus ? ` (${r.subscriptionStatus})` : ''}`
                      : (r.items || r.giftDetails || r.notes || '—')}
                  </td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--gray)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td onClick={e => e.stopPropagation()}><button className="adm-btn-danger" onClick={() => remove(r._id)}>Del</button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No requests</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="adm-modal" style={{ maxWidth: 560 }}>
            <div className="adm-modal-head">
              <div><div className="adm-modal-title">{selected.requestId}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{new Date(selected.createdAt).toLocaleString()}</div></div>
              <button className="adm-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="adm-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Row k="Type" v={`${KIND_LABEL[selected.kind]}${selected.groceryType ? ` · ${selected.groceryType}` : ''}${selected.plan ? ` · ${selected.plan}` : ''}`} />
              {selected.frequency && <Row k="Frequency" v={selected.frequency} />}
              {selected.planCode && <Row k="Plan" v={`${selected.planName} — $${selected.planPrice}/month (${selected.billingType === 'auto-renew' ? 'Auto-Renew' : 'Pay Monthly'})`} />}
              {selected.planCode && <Row k="Payment" v={`${selected.paymentStatus}${selected.subscriptionStatus ? ` · subscription: ${selected.subscriptionStatus}` : ''}`} />}
              <Row k="Customer" v={selected.customer?.name} />
              <Row k="Phone" v={<a href={`tel:${selected.customer?.phone}`}>{selected.customer?.phone}</a>} />
              {selected.customer?.email && <Row k="Email" v={selected.customer.email} />}
              {selected.customer?.address && <Row k="Address" v={`${selected.customer.address}, ${selected.customer.city || ''} ${selected.customer.postalCode || ''}`} />}
              {selected.preferredDate && <Row k="Preferred date" v={selected.preferredDate} />}
              {selected.items && <Row k="Grocery list" v={<span style={{ whiteSpace: 'pre-wrap' }}>{selected.items}</span>} />}
              {selected.giftDetails && <Row k="Gift" v={selected.giftDetails} />}
              {selected.notes && <Row k="Notes" v={selected.notes} />}

              <div style={{ marginTop: 16 }}>
                <div className="form-label" style={{ marginBottom: 8 }}>Status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatus(selected._id, s)}
                      style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${selected.status === s ? 'var(--gold-dk, #b8860b)' : 'var(--gray-lt)'}`,
                        background: selected.status === s ? 'var(--gold-dk, #b8860b)' : 'white', color: selected.status === s ? 'white' : 'var(--black)' }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="adm-modal-foot" style={{ justifyContent: 'space-between' }}>
              <button className="adm-btn-danger" style={{ padding: '8px 16px' }} onClick={() => remove(selected._id)}>Delete</button>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.stripeSubscriptionId && selected.subscriptionStatus === 'active' && (
                  <button className="adm-btn-danger" style={{ padding: '8px 16px' }} onClick={() => cancelSubscription(selected._id)}>Cancel Subscription</button>
                )}
                <button className="adm-btn-outline-s" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-lt)', fontSize: 14 }}>
      <div style={{ width: 120, color: 'var(--gray)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{k}</div>
      <div>{v}</div>
    </div>
  );
}
