import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const CATS = ['All', 'Spirits', 'Wine', 'Beer', 'Ready To Drink', 'Convenience'];
const STORES = ['Liquor Store', 'Beer Store', 'Convenience Store'];
const BADGES = ['', 'Popular', 'Premium', 'Sale', 'New'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Spirits', subCategory: '', store: 'Liquor Store', volume: '', price: '', originalPrice: '', sku: '', stock: '100', badge: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filter !== 'All') q.set('category', filter);
    if (search) q.set('search', search);
    q.set('page', page);
    q.set('limit', 50);
    axios.get(`${API}/products?${q.toString()}`).then(r => {
      setProducts(r.data?.data || []);
      setTotalPages(r.data?.pages || 1);
      setTotal(r.data?.total || 0);
    }).catch(err => { console.error(err); setProducts([]); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [filter, page]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); fetchProducts(); }, 300); return () => clearTimeout(t); }, [search]);

  const openAdd = () => {
    setForm({ name: '', category: 'Spirits', subCategory: '', store: 'Liquor Store', volume: '', price: '', originalPrice: '', sku: '', stock: '100', badge: '', description: '', variants: [] });
    setImageFile(null); setImagePreview(''); setModal('add');
  };

  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', stock: String(p.stock), variants: (p.variants || []).map(v => ({ label: v.label, price: String(v.price), originalPrice: v.originalPrice ? String(v.originalPrice) : '', stock: String(v.stock), sku: v.sku || '', store: v.store || '' })) });
    setImageFile(null); setImagePreview(p.image || ''); setModal(p);
  };

  const addVariant = () => setForm(p => ({ ...p, variants: [...(p.variants || []), { label: '', price: '', originalPrice: '', stock: '100', sku: '', store: '' }] }));
  const updVariant = (i, k, v) => setForm(p => ({ ...p, variants: p.variants.map((x, idx) => idx === i ? { ...x, [k]: v } : x) }));
  const removeVariant = (i) => setForm(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.name || !form.price) return alert('Name and price required');
    setSaving(true);
    try {
      const formData = new FormData();
      ['name','category','subCategory','store','volume','badge','description','sku'].forEach(k => formData.append(k, form[k] || ''));
      formData.set('price', parseFloat(form.price));
      formData.set('originalPrice', parseFloat(form.originalPrice) || 0);
      formData.set('stock', parseInt(form.stock) || 100);
      const cleanVariants = (form.variants || [])
        .filter(v => v.label && v.price !== '')
        .map(v => ({ label: v.label.trim(), price: parseFloat(v.price) || 0, originalPrice: parseFloat(v.originalPrice) || 0, stock: parseInt(v.stock) || 0, sku: v.sku || '', store: v.store || '' }));
      formData.set('variants', JSON.stringify(cleanVariants));
      if (imageFile) formData.append('image', imageFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (modal === 'add') await axios.post(`${API}/products`, formData, config);
      else await axios.put(`${API}/products/${modal._id}`, formData, config);
      setModal(null); fetchProducts();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await axios.delete(`${API}/products/${id}`); fetchProducts(); } catch { alert('Failed'); }
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const shuffleProducts = async () => {
    const label = filter === 'All' ? 'all products' : `all ${filter} products`;
    if (!window.confirm(`Shuffle the display order of ${label} on the website? Customers will see a different product order next time they browse.`)) return;
    setShuffling(true);
    try {
      await axios.post(`${API}/products/shuffle`, { category: filter });
      setPage(1); fetchProducts();
    } catch { alert('Failed to shuffle'); }
    setShuffling(false);
  };

  return (
    <>
      <div className="adm-topbar">
        <div>
          <div className="adm-page-title">Products</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{total} total &middot; Page {page} of {totalPages}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="adm-btn-outline-s" onClick={shuffleProducts} disabled={shuffling} title="Randomize the display order customers see on the website">
            {shuffling ? 'Shuffling...' : `🔀 Shuffle ${filter === 'All' ? 'Products' : filter}`}
          </button>
          <button className="adm-btn adm-btn-gold" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          style={{ width: '100%', maxWidth: 400, padding: '10px 16px', border: '1.5px solid var(--gray-lt)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white' }} />
      </div>

      <div className="adm-filters">
        {CATS.map(c => <button key={c} className={`adm-filter-pill${filter === c ? ' active' : ''}`} onClick={() => { setFilter(c); setPage(1); }}>{c}</button>)}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th style={{ width: 56 }}>Img</th><th>Name</th><th>SKU</th><th>Category</th><th>Sub</th><th>Vol</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.image ? <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gray)' }}>—</div>}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray)' }}>{p.sku || '—'}</td>
                    <td style={{ fontSize: 12 }}>{p.category}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray)' }}>{p.subCategory}</td>
                    <td style={{ fontSize: 12 }}>{p.volume}</td>
                    <td style={{ fontWeight: 700 }}>${(p.price || 0).toFixed(2)}{p.originalPrice > p.price && <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>Save ${(p.originalPrice - p.price).toFixed(2)}</div>}</td>
                    <td><span style={{ color: p.stock < 10 ? 'var(--red)' : 'inherit', fontWeight: p.stock < 10 ? 700 : 400 }}>{p.stock}</span></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="adm-btn-action" onClick={() => openEdit(p)}>Edit</button>
                      <button className="adm-btn-danger" onClick={() => remove(p._id)}>Del</button>
                    </div></td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No products</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', border: '1.5px solid var(--gray-lt)', borderRadius: 6, background: 'white', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>Prev</button>
              <span style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600 }}>Page {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', border: '1.5px solid var(--gray-lt)', borderRadius: 6, background: 'white', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>Next</button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <div className="adm-modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</div>
              <button className="adm-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 90, height: 90, borderRadius: 10, background: 'var(--cream)', border: '2px dashed var(--gray-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, color: 'var(--gray)' }}>No image</span>}
                  </div>
                  <div><input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13 }} /><div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>JPG, PNG, WebP</div></div>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => upd('category', e.target.value)}>{CATS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Store</label><select className="form-input" value={form.store} onChange={e => upd('store', e.target.value)}>{STORES.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Sub Category</label><input className="form-input" value={form.subCategory} onChange={e => upd('subCategory', e.target.value)} placeholder="e.g. Canadian Whisky" /></div>
                <div className="form-group"><label className="form-label">Volume</label><input className="form-input" value={form.volume} onChange={e => upd('volume', e.target.value)} placeholder="750ml" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Price ($) *</label><input className="form-input" type="number" step="0.01" value={form.price} onChange={e => upd('price', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Original Price ($) — for Sale</label><input className="form-input" type="number" step="0.01" value={form.originalPrice} onChange={e => upd('originalPrice', e.target.value)} placeholder="Leave blank if not on sale" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" value={form.stock} onChange={e => upd('stock', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku} onChange={e => upd('sku', e.target.value)} placeholder="e.g. DAL-750" /></div>
              </div>
              <div className="form-group"><label className="form-label">Badge</label><select className="form-input" value={form.badge} onChange={e => upd('badge', e.target.value)}>{BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => upd('description', e.target.value)} placeholder="Tasting notes, origin, etc." style={{ resize: 'vertical' }} /></div>

              <div className="form-group" style={{ borderTop: '1px solid var(--gray-lt)', paddingTop: 16, marginTop: 8 }}>
                <label className="form-label">Size Options (optional)</label>
                <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 10 }}>Add sizes with their own price (e.g. 1750 mL Bottle — $69.95). If none, the single price above is used. One image is shared for all sizes. Leave "Store" as Default unless this specific size is picked up from a different store than the product's main store.</div>
                {(form.variants || []).map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input className="form-input" style={{ flex: 2, minWidth: 140 }} value={v.label} onChange={e => updVariant(i, 'label', e.target.value)} placeholder="750 mL Bottle" />
                    <input className="form-input" style={{ flex: 1, minWidth: 80 }} type="number" step="0.01" value={v.price} onChange={e => updVariant(i, 'price', e.target.value)} placeholder="Price" />
                    <input className="form-input" style={{ flex: 1, minWidth: 80 }} type="number" step="0.01" value={v.originalPrice} onChange={e => updVariant(i, 'originalPrice', e.target.value)} placeholder="Orig. Price" />
                    <input className="form-input" style={{ flex: 1, minWidth: 70 }} type="number" value={v.stock} onChange={e => updVariant(i, 'stock', e.target.value)} placeholder="Stock" />
                    <input className="form-input" style={{ flex: 1, minWidth: 90 }} value={v.sku} onChange={e => updVariant(i, 'sku', e.target.value)} placeholder="SKU" />
                    <select className="form-input" style={{ flex: 1, minWidth: 110 }} value={v.store || ''} onChange={e => updVariant(i, 'store', e.target.value)}>
                      <option value="">Store: Default</option>
                      {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="adm-btn-danger" onClick={() => removeVariant(i)}>✕</button>
                  </div>
                ))}
                <button className="adm-btn-outline-s" onClick={addVariant}>+ Add Size</button>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-outline-s" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-gold" onClick={save} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}