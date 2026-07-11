import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Gifts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reqId, setReqId] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: user?.address || '', city: user?.city || 'Mississauga', postalCode: user?.postalCode || '',
    giftDetails: '', preferredDate: '', notes: ''
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.phone) return alert('Please enter your name and phone');
    if (!form.giftDetails) return alert('Please tell us what gift you would like');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/services`, {
        kind: 'gift',
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, postalCode: form.postalCode },
        giftDetails: form.giftDetails, preferredDate: form.preferredDate, notes: form.notes
      });
      setReqId(res.data.data.requestId);
    } catch (err) { alert(err.response?.data?.message || 'Could not submit request'); }
    setLoading(false);
  };

  if (reqId) return (
    <div className="section"><div className="container" style={{ maxWidth: 640, textAlign: 'center', padding: '40px 20px' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto 20px' }}><circle cx="36" cy="36" r="36" fill="#DCFCE7" /><path d="M22 36l10 10 18-18" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: 24, fontWeight: 800 }}>Gift Request Received!</div>
      <p style={{ color: 'var(--gray)', margin: '10px 0 6px' }}>We&apos;ll reach out to arrange your gift.</p>
      <div style={{ display: 'inline-block', background: 'var(--cream)', padding: '8px 18px', borderRadius: 8, fontWeight: 700, letterSpacing: 1 }}>{reqId}</div>
    </div></div>
  );

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
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Request Gift'} <ArrowIcon /></button>
        </div>
      </div>
    </div>
  );
}
