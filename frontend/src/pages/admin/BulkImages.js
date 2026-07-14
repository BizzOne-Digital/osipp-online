import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function BulkImages() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [show, setShow] = useState(60);
  const [busy, setBusy] = useState({});     // id -> true while uploading
  const [copied, setCopied] = useState('');

  const fetchAll = () => {
    setLoading(true);
    axios.get(`${API}/products/all?limit=5000`)
      .then(r => setProducts(r.data?.data || []))
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter(p => {
      if (onlyMissing && p.image) return false;
      if (s && !p.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [products, search, onlyMissing]);

  const withImg = products.filter(p => p.image).length;

  const patch = (id, data) => setProducts(prev => prev.map(p => p._id === id ? { ...p, ...data } : p));

  const copyName = (name) => {
    navigator.clipboard?.writeText(name);
    setCopied(name); setTimeout(() => setCopied(''), 1200);
  };

  const onFile = async (product, file) => {
    if (!file) return;
    setBusy(b => ({ ...b, [product._id]: true }));
    try {
      const fd = new FormData();
      fd.append('image', file);
      const up = await axios.post(`${API}/products/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axios.put(`${API}/products/${product._id}/image`, { image: up.data.url });
      patch(product._id, { image: up.data.url });
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    setBusy(b => ({ ...b, [product._id]: false }));
  };

  return (
    <>
      <div className="adm-topbar">
        <div>
          <div className="adm-page-title">Bulk Images</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>
            {withImg} / {products.length} have images &middot; {products.length - withImg} missing
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setShow(60); }} placeholder="Search product..."
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1.5px solid var(--gray-lt)', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={onlyMissing} onChange={e => { setOnlyMissing(e.target.checked); setShow(60); }} /> Only missing images
        </label>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-lt)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--gray)', marginBottom: 18 }}>
        Har product ke saamne <strong>Copy</strong> se naam copy karo, image download karo, phir <strong>Upload</strong> se turant lag jayegi. Assign hote hi list se hat jayega (agar "Only missing" on hai).
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
            {filtered.slice(0, show).map(p => (
              <div key={p._id} style={{ border: `1.5px solid ${p.image ? 'var(--green)' : 'var(--gray-lt)'}`, borderRadius: 12, overflow: 'hidden', background: 'white' }}>
                <div style={{ height: 130, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {busy[p._id] ? <div className="spinner" />
                    : p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                    : <span style={{ fontSize: 11, color: 'var(--gray)' }}>No image</span>}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 10 }}>{p.category}{p.subCategory ? ` · ${p.subCategory}` : ''}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => copyName(p.name)} className="adm-btn-outline-s" style={{ flex: 1, fontSize: 12 }}>
                      {copied === p.name ? 'Copied!' : 'Copy'}
                    </button>
                    <label className="adm-btn adm-btn-gold" style={{ flex: 1, cursor: 'pointer', fontSize: 12, textAlign: 'center', justifyContent: 'center' }}>
                      {p.image ? 'Replace' : 'Upload'}
                      <input type="file" accept="image/*" onChange={e => onFile(p, e.target.files?.[0])} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>Nothing to show.</div>}
          {show < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="adm-btn adm-btn-gold" onClick={() => setShow(s => s + 60)}>Load more ({filtered.length - show} left)</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
