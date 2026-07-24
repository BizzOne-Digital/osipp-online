import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';
const GIFT_FEE = 13.99;

export default function Gifts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: user?.address || '', city: user?.city || 'Mississauga', postalCode: user?.postalCode || '',
    giftDetails: '', preferredDate: '', notes: ''
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.phone) return alert('Please enter your name and phone');
    if (!form.giftDetails) return alert('Please tell us what gift you would like');
    if (!form.address) return alert('Please enter your delivery address');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/services/checkout`, {
        serviceType: 'gift',
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, postalCode: form.postalCode },
        giftDetails: form.giftDetails, preferredDate: form.preferredDate, notes: form.notes
      });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) { alert(err.response?.data?.message || 'Could not start checkout'); setLoading(false); }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="section-title">Gifts</div>
          <div className="section-sub">Add a special touch to any delivery.</div>
        </div>
        <div className="adm-table-wrap" style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">What gift would you like?</label>
            <textarea className="form-input" rows={4} value={form.giftDetails} onChange={e => upd('giftDetails', e.target.value)}
              placeholder="Flowers, a greeting card, a Christmas tree, or anything for a special occasion — tell us the details." style={{ resize: 'vertical' }} />
            <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>e.g. Flowers, Cards, Christmas Tree, birthday/anniversary specials.</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Delivery Address</label><input className="form-input" value={form.address} onChange={e => upd('address', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => upd('city', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Preferred date</label><input className="form-input" type="date" value={form.preferredDate} onChange={e => upd('preferredDate', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Message on card, timing, budget..." /></div>
          <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
            <span>Gift Delivery Fee</span><span>${GIFT_FEE.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--gray)', marginBottom: 14 }}>The cost of the gift item itself is arranged and paid separately when we confirm the details with you.</div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submit} disabled={loading}>{loading ? 'Redirecting...' : `Pay $${GIFT_FEE.toFixed(2)} & Request Gift`} <ArrowIcon /></button>
        </div>
      </div>
    </div>
  );
}
