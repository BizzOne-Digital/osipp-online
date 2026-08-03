import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const PROMO_TYPES = ['banner', 'percentage', 'fixed'];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('general');
  const [newLocation, setNewLocation] = useState('');
  const [promoModal, setPromoModal] = useState(null);
  const [promoForm, setPromoForm] = useState({ title: '', description: '', type: 'banner', value: 0, code: '', minOrder: 0, isActive: true });

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/settings`),
      axios.get(`${API}/promotions`)
    ]).then(([s, p]) => {
      setSettings(s.data.data);
      setPromos(p.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const updHours = (k, v) => setSettings(p => ({ ...p, deliveryHours: { ...p.deliveryHours, [k]: v } }));
  const updStoreFee = (store, v) => setSettings(p => ({ ...p, storeDeliveryFees: { ...p.storeDeliveryFees, [store]: parseFloat(v) || 0 } }));

  // Add-ons
  const addAddOn = () => setSettings(p => ({ ...p, addOns: [...(p.addOns || []), { name: '', price: 0, isActive: true, isTobacco: false, store: '' }] }));
  const updAddOn = (idx, k, v) => setSettings(p => ({ ...p, addOns: p.addOns.map((a, i) => i === idx ? { ...a, [k]: v } : a) }));
  const removeAddOn = (idx) => setSettings(p => ({ ...p, addOns: p.addOns.filter((_, i) => i !== idx) }));

  // Tip presets
  const updTipPresets = (v) => setSettings(p => ({ ...p, tipPresets: v.split(',').map(x => parseFloat(x.trim())).filter(n => !isNaN(n)) }));

  const saveSettings = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await axios.put(`${API}/settings`, settings);
      setSettings(res.data.data);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save'); }
    setSaving(false);
  };

  const addLocation = () => {
    if (!newLocation.trim()) return;
    const locs = [...(settings.deliveryLocations || []), newLocation.trim()];
    setSettings(p => ({ ...p, deliveryLocations: locs }));
    setNewLocation('');
  };

  const removeLocation = (idx) => {
    const locs = settings.deliveryLocations.filter((_, i) => i !== idx);
    setSettings(p => ({ ...p, deliveryLocations: locs }));
  };

  const fetchPromos = () => axios.get(`${API}/promotions`).then(r => setPromos(r.data.data || []));

  const openAddPromo = () => {
    setPromoForm({ title: '', description: '', type: 'banner', value: 0, code: '', minOrder: 0, isActive: true });
    setPromoModal('add');
  };

  const openEditPromo = (p) => { setPromoForm({ ...p }); setPromoModal(p); };

  const savePromo = async () => {
    try {
      if (promoModal === 'add') await axios.post(`${API}/promotions`, promoForm);
      else await axios.put(`${API}/promotions/${promoModal._id}`, promoForm);
      setPromoModal(null); fetchPromos();
    } catch { alert('Failed to save promotion'); }
  };

  const deletePromo = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try { await axios.delete(`${API}/promotions/${id}`); fetchPromos(); } catch { alert('Failed'); }
  };

  const togglePromo = async (p) => {
    try { await axios.put(`${API}/promotions/${p._id}`, { isActive: !p.isActive }); fetchPromos(); } catch {}
  };

  const updPromo = (k, v) => setPromoForm(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!settings) return <div className="empty">Failed to load settings</div>;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'addons', label: 'Add-ons & Tips' },
    { id: 'locations', label: 'Locations' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'hours', label: 'Hours' },
  ];

  return (
    <>
      <div className="adm-topbar">
        <div className="adm-page-title">Settings</div>
        {saved && <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>Saved!</span>}
      </div>

      <div className="adm-filters" style={{ marginBottom: 24 }}>
        {tabs.map(t => <button key={t.id} className={`adm-filter-pill${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div style={{ maxWidth: 640 }}>

        {/* General */}
        {tab === 'general' && (
          <div className="adm-table-wrap" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Business Information</div>
            <div className="form-group"><label className="form-label">Business Name</label><input className="form-input" value={settings.businessName} onChange={e => upd('businessName', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={settings.phone} onChange={e => upd('phone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">WhatsApp</label><input className="form-input" value={settings.whatsapp} onChange={e => upd('whatsapp', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={settings.email} onChange={e => upd('email', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={settings.instagram} onChange={e => upd('instagram', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={settings.address} onChange={e => upd('address', e.target.value)} /></div>
            <button className="adm-btn adm-btn-gold" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}

        {/* Delivery */}
        {tab === 'delivery' && (
          <div className="adm-table-wrap" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Delivery Settings</div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Delivery Fee ($)</label><input className="form-input" type="number" step="0.01" value={settings.deliveryFee} onChange={e => upd('deliveryFee', parseFloat(e.target.value))} /></div>
              <div className="form-group"><label className="form-label">Fee Note</label><input className="form-input" value={settings.deliveryFeeNote || ''} onChange={e => upd('deliveryFeeNote', e.target.value)} placeholder="Taxes included" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Delivery Time</label><input className="form-input" value={settings.deliveryTime || ''} onChange={e => upd('deliveryTime', e.target.value)} placeholder="1 hour" /></div>
              <div className="form-group"><label className="form-label">Min Order ($)</label><input className="form-input" type="number" value={settings.minOrder} onChange={e => upd('minOrder', parseFloat(e.target.value))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Age Requirement</label><input className="form-input" value={settings.ageRequirement || ''} onChange={e => upd('ageRequirement', e.target.value)} /></div>

            <div style={{ borderTop: '1px solid var(--gray-lt)', margin: '20px 0', paddingTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!settings.useStopBasedDelivery} onChange={e => upd('useStopBasedDelivery', e.target.checked)} />
                Charge delivery per store stop (multiple stops = higher fee)
              </label>
              <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6, marginBottom: 16 }}>
                When on: total delivery = sum of the fees for each distinct store in the order. When off: the flat Delivery Fee above is used.
              </div>
              {settings.useStopBasedDelivery && (
                <div className="form-row" style={{ flexWrap: 'wrap' }}>
                  {['Liquor Store', 'Beer Store', 'Convenience Store'].map(store => (
                    <div className="form-group" key={store} style={{ minWidth: 150 }}>
                      <label className="form-label">{store} ($)</label>
                      <input className="form-input" type="number" step="0.01"
                        value={settings.storeDeliveryFees?.[store] ?? ''}
                        onChange={e => updStoreFee(store, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="adm-btn adm-btn-gold" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}

        {/* Add-ons & Tips */}
        {tab === 'addons' && (
          <div className="adm-table-wrap" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Extra Add-on Items</div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 16 }}>Items customers can add at checkout (e.g. pack of smokes, ice, lighter).</div>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 10 }}>Set "Store" if this item requires its own pickup stop (e.g. cigarettes from the Convenience Store) — it'll count toward the delivery tier like a real product would.</div>
            {(settings.addOns || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                <input className="form-input" style={{ flex: 2, minWidth: 140 }} value={a.name} onChange={e => updAddOn(i, 'name', e.target.value)} placeholder="Item name" />
                <input className="form-input" style={{ flex: 1, minWidth: 80 }} type="number" step="0.01" value={a.price} onChange={e => updAddOn(i, 'price', parseFloat(e.target.value) || 0)} placeholder="Price" />
                <select className="form-input" style={{ flex: 1, minWidth: 130 }} value={a.store || ''} onChange={e => updAddOn(i, 'store', e.target.value)}>
                  <option value="">No extra stop</option>
                  <option value="Liquor Store">Liquor Store</option>
                  <option value="Beer Store">Beer Store</option>
                  <option value="Convenience Store">Convenience Store</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={a.isActive !== false} onChange={e => updAddOn(i, 'isActive', e.target.checked)} /> Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={!!a.isTobacco} onChange={e => updAddOn(i, 'isTobacco', e.target.checked)} /> Tobacco
                </label>
                <button className="adm-btn-danger" onClick={() => removeAddOn(i)}>Del</button>
              </div>
            ))}
            <button className="adm-btn-outline-s" onClick={addAddOn} style={{ marginTop: 6 }}>+ Add Item</button>

            <div style={{ borderTop: '1px solid var(--gray-lt)', margin: '24px 0', paddingTop: 20 }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Driver Tips</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>
                <input type="checkbox" checked={settings.tipEnabled !== false} onChange={e => upd('tipEnabled', e.target.checked)} />
                Show tip option at checkout
              </label>
              <div className="form-group">
                <label className="form-label">Tip preset percentages (%, comma separated)</label>
                <input className="form-input" defaultValue={(settings.tipPresets || []).join(', ')} onBlur={e => updTipPresets(e.target.value)} placeholder="10, 15, 20" />
                <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>"No Tip" always shows last, after these options.</div>
              </div>
            </div>

            <button className="adm-btn adm-btn-gold" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}

        {/* Locations */}
        {tab === 'locations' && (
          <div className="adm-table-wrap" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Delivery Locations</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input className="form-input" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Add a city/area..." onKeyDown={e => e.key === 'Enter' && addLocation()} style={{ flex: 1 }} />
              <button className="adm-btn adm-btn-gold" onClick={addLocation}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(settings.deliveryLocations || []).map((loc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--cream)', border: '1px solid var(--gray-lt)',
                  borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 500
                }}>
                  {loc}
                  <button onClick={() => removeLocation(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--red)', lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
            {(settings.deliveryLocations || []).length === 0 && <div style={{ color: 'var(--gray)', fontSize: 13, padding: 16 }}>No locations added yet</div>}
            <div style={{ marginTop: 20 }}><button className="adm-btn adm-btn-gold" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Locations'}</button></div>
          </div>
        )}

        {/* Promotions */}
        {tab === 'promotions' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Promotions & Discounts</div>
              <button className="adm-btn adm-btn-gold" onClick={openAddPromo}>+ Add Promotion</button>
            </div>
            {promos.length === 0 ? (
              <div className="adm-table-wrap" style={{ padding: 40, textAlign: 'center', color: 'var(--gray)' }}>No promotions yet. Add one to display banners or discounts.</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Title</th><th>Type</th><th>Value</th><th>Code</th><th>Active</th><th>Actions</th></tr></thead>
                  <tbody>
                    {promos.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td style={{ textTransform: 'capitalize' }}>{p.type}</td>
                        <td>{p.type === 'percentage' ? `${p.value}%` : p.type === 'fixed' ? `$${p.value}` : '—'}</td>
                        <td>{p.code || '—'}</td>
                        <td>
                          <button onClick={() => togglePromo(p)} style={{
                            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                            background: p.isActive ? '#D4EDDA' : '#F8D7DA', color: p.isActive ? '#155724' : '#721C24'
                          }}>{p.isActive ? 'Active' : 'Inactive'}</button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="adm-btn-action" onClick={() => openEditPromo(p)}>Edit</button>
                            <button className="adm-btn-danger" onClick={() => deletePromo(p._id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Hours */}
        {tab === 'hours' && (
          <div className="adm-table-wrap" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Delivery Hours</div>
            <div className="form-group"><label className="form-label">Mon - Thu</label><input className="form-input" value={settings.deliveryHours?.monThu || ''} onChange={e => updHours('monThu', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Fri - Sat</label><input className="form-input" value={settings.deliveryHours?.friSat || ''} onChange={e => updHours('friSat', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Sunday</label><input className="form-input" value={settings.deliveryHours?.sunday || ''} onChange={e => updHours('sunday', e.target.value)} /></div>
            <button className="adm-btn adm-btn-gold" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        )}
      </div>

      {/* Promotion Add/Edit Modal */}
      {promoModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setPromoModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <div className="adm-modal-title">{promoModal === 'add' ? 'Add Promotion' : 'Edit Promotion'}</div>
              <button className="adm-close-btn" onClick={() => setPromoModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={promoForm.title} onChange={e => updPromo('title', e.target.value)} placeholder="Weekend Special!" /></div>
              <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={promoForm.description} onChange={e => updPromo('description', e.target.value)} placeholder="20% off all spirits this weekend" /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={promoForm.type} onChange={e => updPromo('type', e.target.value)}>
                    {PROMO_TYPES.map(t => <option key={t} value={t}>{t === 'banner' ? 'Banner Only' : t === 'percentage' ? 'Percentage Off' : 'Fixed $ Off'}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Value {promoForm.type === 'percentage' ? '(%)' : '($)'}</label><input className="form-input" type="number" value={promoForm.value} onChange={e => updPromo('value', parseFloat(e.target.value))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Promo Code</label><input className="form-input" value={promoForm.code} onChange={e => updPromo('code', e.target.value)} placeholder="WEEKEND20" /></div>
                <div className="form-group"><label className="form-label">Min Order ($)</label><input className="form-input" type="number" value={promoForm.minOrder} onChange={e => updPromo('minOrder', parseFloat(e.target.value))} /></div>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-outline-s" onClick={() => setPromoModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-gold" onClick={savePromo}>{promoModal === 'add' ? 'Add' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
