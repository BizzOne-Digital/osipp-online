import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

// Turns the admin's plain-text content into React elements: blank line = new paragraph,
// "## " = heading, "- " = bullet. Rendered as text (never raw HTML), so nothing in a post can inject markup.
function renderContent(text) {
  return String(text || '').split(/\n\s*\n/).map((block, i) => {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines.length) return null;
    if (lines.length === 1 && lines[0].startsWith('## ')) {
      return <h2 key={i} style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 10px' }}>{lines[0].slice(3)}</h2>;
    }
    if (lines.every(l => l.trim().startsWith('- '))) {
      return <ul key={i} style={{ paddingLeft: 22, margin: '0 0 16px' }}>{lines.map((l, j) => <li key={j} style={{ marginBottom: 6 }}>{l.trim().slice(2)}</li>)}</ul>;
    }
    return <p key={i} style={{ margin: '0 0 16px', whiteSpace: 'pre-line' }}>{lines.join('\n')}</p>;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    axios.get(`${API}/blogs/${slug}`).then(r => { setPost(r.data.data); setStatus('ok'); }).catch(() => setStatus('missing'));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = `${post.title} | O'SIPP Delivery`;
    const meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta ? meta.content : null;
    if (meta) meta.setAttribute('content', post.metaDescription || post.excerpt || post.title);
    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) meta.setAttribute('content', prevDescription);
    };
  }, [post]);

  if (status === 'loading') return <div className="section"><div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" /></div></div>;
  if (status === 'missing') return (
    <div className="section"><div className="container" style={{ maxWidth: 760, textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Post not found</div>
      <Link to="/blog" className="btn-primary">Back to Blog</Link>
    </div></div>
  );

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 20 }}>
          <Link to="/" style={{ color: 'var(--gray)', textDecoration: 'none' }}>Home</Link>
          <span> / </span>
          <Link to="/blog" style={{ color: 'var(--gray)', textDecoration: 'none' }}>Blog</Link>
          <span> / </span>
          <span style={{ color: 'var(--black)', fontWeight: 600 }}>{post.title}</span>
        </div>
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 8 }}>{post.title}</h1>
        {post.publishedAt && <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 22 }}>{new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
        {post.image && <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 12, marginBottom: 26 }} />}
        <div style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--black)' }}>{renderContent(post.content)}</div>
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1.5px solid var(--gray-lt)' }}>
          <Link to="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    </div>
  );
}
