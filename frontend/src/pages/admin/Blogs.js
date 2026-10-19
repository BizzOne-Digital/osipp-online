import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';
const emptyForm = { title: '', slug: '', excerpt: '', content: '', metaDescription: '', status: 'draft' };

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | post object
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    axios.get(`${API}/blogs?all=true`).then(r => setPosts(r.data?.data || [])).catch(() => setPosts([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPosts(); }, []);

  const openAdd = () => { setForm(emptyForm); setImageFile(null); setImagePreview(''); setModal('add'); };
  const openEdit = async (p) => {
    try {
      const r = await axios.get(`${API}/blogs/admin/${p._id}`);
      const full = r.data.data;
      setForm({ title: full.title, slug: full.slug, excerpt: full.excerpt || '', content: full.content || '', metaDescription: full.metaDescription || '', status: full.status });
      setImageFile(null); setImagePreview(full.image || '');
      setModal(full);
    } catch { alert('Failed to load post'); }
  };
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const pickImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!form.title.trim()) return alert('Title is required');
    if (!form.content.trim()) return alert('Content is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (modal === 'add') await axios.post(`${API}/blogs`, fd, config);
      else await axios.put(`${API}/blogs/${modal._id}`, fd, config);
      setModal(null); fetchPosts();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save post'); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    try { await axios.delete(`${API}/blogs/${id}`); fetchPosts(); } catch { alert('Failed'); }
  };

  const toggleStatus = async (p) => {
    const fd = new FormData();
    fd.append('status', p.status === 'published' ? 'draft' : 'published');
    try { await axios.put(`${API}/blogs/${p._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); fetchPosts(); } catch { alert('Failed'); }
  };

  return (
    <>
      <div className="adm-topbar">
        <div>
          <div className="adm-page-title">Blog</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>{posts.length} total</div>
        </div>
        <button className="adm-btn adm-btn-gold" onClick={openAdd}>+ New Post</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Image</th><th>Title</th><th>Published</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id}>
                  <td>{p.image ? <img src={p.image} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '—'}</td>
                  <td><div style={{ fontWeight: 700 }}>{p.title}</div><div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>/blog/{p.slug}</div></td>
                  <td style={{ fontSize: 12 }}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button onClick={() => toggleStatus(p)} className={`badge ${p.status === 'published' ? 'confirmed' : 'cancelled'}`} style={{ cursor: 'pointer', border: 'none' }}>
                      {p.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td><div style={{ display: 'flex', gap: 6 }}>
                    {p.status === 'published' && <a className="adm-btn-action" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>View</a>}
                    <button className="adm-btn-action" onClick={() => openEdit(p)}>Edit</button>
                    <button className="adm-btn-danger" onClick={() => remove(p._id)}>Del</button>
                  </div></td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No blog posts yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal" style={{ maxWidth: 760 }}>
            <div className="adm-modal-head">
              <div className="adm-modal-title">{modal === 'add' ? 'New Blog Post' : 'Edit Blog Post'}</div>
              <button className="adm-close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => upd('title', e.target.value)} placeholder="e.g. 5 Wines to Pair With Holiday Dinner" /></div>
              <div className="form-group"><label className="form-label">URL Slug (optional)</label><input className="form-input" value={form.slug} onChange={e => upd('slug', e.target.value)} placeholder="Auto-generated from title" /></div>
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                {imagePreview && <img src={imagePreview} alt="" style={{ display: 'block', maxWidth: '100%', maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} />
              </div>
              <div className="form-group"><label className="form-label">Short Summary</label><textarea className="form-input" rows={2} value={form.excerpt} onChange={e => upd('excerpt', e.target.value)} placeholder="Shown on the blog listing page" /></div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-input" rows={14} value={form.content} onChange={e => upd('content', e.target.value)} placeholder={'Leave a blank line between paragraphs.\n## Start a line with ## for a heading\n- Start a line with - for a bullet point'} style={{ fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
              <div className="form-group"><label className="form-label">SEO Meta Description (optional)</label><input className="form-input" value={form.metaDescription} onChange={e => upd('metaDescription', e.target.value)} placeholder="Shown in Google search results" /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => upd('status', e.target.value)}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option></select></div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-outline-s" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-gold" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
