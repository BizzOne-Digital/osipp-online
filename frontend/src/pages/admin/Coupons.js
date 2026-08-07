import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const emptyForm = { code: '', type: 'fixed', value: '', minOrder: '0', maxDiscount: '', usageLimit: '', perUserLimit: '1', isActive: true, endDate: '', description: '' };

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | coupon object
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    axios.get(`${API}/coupons`).then(r => setCoupons(r.data?.data || [])).catch(() => setCoupons([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCoupons(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      code: c.code, type: c.type, value: String(c.value), minOrder: String(c.minOrder || 0),
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '', usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
      perUserLimit: String(c.perUserLimit ?? 1), isActive: c.isActive !== false,
      endDate: c.endDate ? c.endDate.slice(0, 10) : '', description: c.description || ''
    });
    setModal(c);
  };
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.code || !form.value) return alert('Code and value are required');
    setSaving(true);
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(form.value) || 0,
        minOrder: parseFloat(form.minOrder) || 0,
        maxDiscount: form.maxDiscount === '' ? null : parseFloat(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : parseInt(form.usageLimit),
        perUserLimit: form.perUserLimit === '' ? null : parseInt(form.perUserLimit),
        isActive: form.isActive,
        endDate: form.endDate || null,
        description: form.description
      };
      if (modal === 'add') await axios.post(`${API}/coupons`, body);
      else await axios.put(`${API}/coupons/${modal._id}`, body);
      setModal(null); fetchCoupons();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save — code may already be in use'); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await axios.delete(`${API}/coupons/${id}`); fetchCoupons(); } catch { alert('Failed'); }
  };

  const toggleActive = async (c) => {
    try { await axios.put(`${API}/coupons/${c._id}`, { isActive: !c.isActive }); fetchCoupons(); } catch { alert('Failed'); }
  };

  return (
    <>
      <div className="adm-topbar">
        <div>
          <div className="adm-page-title">Coupons</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{coupons.length} total</div>
        </div>
        <button className="adm-btn adm-btn-gold" onClick={openAdd}>+ Add Coupon</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Used</th><th>Per-User Limit</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><span className="id-badge">{c.code}</span>{c.description && <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>{c.description}</div>}</td>
                  <td style={{ fontWeight: 700 }}>{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}{c.maxDiscount ? ` (max $${c.maxDiscount})` : ''}</td>
                  <td>{c.minOrder ? `$${c.minOrder}` : '—'}</td>
                  <td>{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td>{c.perUserLimit ?? '∞'}</td>
                  <td style={{ fontSize: 12 }}>{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <button onClick={() => toggleActive(c)} className={`badge ${c.isActive !== false ? 'confirmed' : 'cancelled'}`} style={{ cursor: 'pointer', border: 'none' }}>
                      {c.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td><div style={{ display: 'flex', gap: 6 }}>
                    <button className="adm-btn-action" onClick={() => openEdit(c)}>Edit</button>
                    <button className="adm-btn-danger" onClick={() => remove(c._id)}>Del</button>
                  </div></td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No coupons yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <div className="adm-modal-title">{modal === 'add' ? 'Add Coupon' : 'Edit Coupon'}</div>
              <button className="adm-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={form.code} onChange={e => upd('code', e.target.value)} placeholder="e.g. WELCOME10" style={{ textTransform: 'uppercase' }} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={e => upd('type', e.target.value)}><option value="fixed">Fixed $ Amount</option><option value="percentage">Percentage %</option></select></div>
                <div className="form-group"><label className="form-label">Value *</label><input className="form-input" type="number" step="0.01" value={form.value} onChange={e => upd('value', e.target.value)} placeholder={form.type === 'percentage' ? 'e.g. 10 (for 10%)' : 'e.g. 10 (for $10)'} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Minimum Order ($)</label><input className="form-input" type="number" step="0.01" value={form.minOrder} onChange={e => upd('minOrder', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Max Discount ($, optional)</label><input className="form-input" type="number" step="0.01" value={form.maxDiscount} onChange={e => upd('maxDiscount', e.target.value)} placeholder="No cap" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Total Usage Limit (optional)</label><input className="form-input" type="number" value={form.usageLimit} onChange={e => upd('usageLimit', e.target.value)} placeholder="Unlimited" /></div>
                <div className="form-group"><label className="form-label">Per-Customer Limit</label><input className="form-input" type="number" value={form.perUserLimit} onChange={e => upd('perUserLimit', e.target.value)} placeholder="e.g. 1 for first-order-only" /></div>
              </div>
              <div className="form-group"><label className="form-label">Expires On (optional)</label><input className="form-input" type="date" value={form.endDate} onChange={e => upd('endDate', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Description (internal note)</label><input className="form-input" value={form.description} onChange={e => upd('description', e.target.value)} placeholder="e.g. Welcome offer for new customers" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => upd('isActive', e.target.checked)} /> Active
              </label>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-outline-s" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-gold" onClick={save} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Coupon' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
