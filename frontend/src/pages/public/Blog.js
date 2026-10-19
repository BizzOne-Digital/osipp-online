import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Blog | O'SIPP Delivery";
    axios.get(`${API}/blogs`).then(r => setPosts(r.data?.data || [])).catch(() => setPosts([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 1000 }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
          <div className="section-title">Blog</div>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>No posts yet. Check back soon.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
            {posts.map(p => (
              <Link key={p._id} to={`/blog/${p.slug}`} className="adm-table-wrap" style={{ display: 'block', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
                {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />}
                <div style={{ padding: '16px 18px' }}>
                  {p.publishedAt && <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 6 }}>{new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: 'var(--black)' }}>{p.title}</div>
                  {p.excerpt && <div style={{ fontSize: 13.5, color: 'var(--gray)', lineHeight: 1.6 }}>{p.excerpt}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
