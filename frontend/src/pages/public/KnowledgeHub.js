import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import knowledgeHub from '../../data/knowledgeHub';
import { ArrowIcon } from '../../components/Icons';

// Sets the document <title> and meta description for this specific guide page — since this
// is a client-rendered SPA (no server-side rendering), this at least gives search engines and
// browser tabs/link-previews a unique, accurate title/description per guide instead of the
// site-wide default from index.html.
function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | O'SIPP Delivery`;
    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta ? meta.content : null;
    if (meta) meta.setAttribute('content', description);
    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}

export default function KnowledgeHub() {
  const { slug } = useParams();
  const guide = knowledgeHub[slug];

  usePageMeta(guide ? guide.title : 'Knowledge Hub', guide ? guide.metaDescription : '');

  if (!guide) return <Navigate to="/products" replace />;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 20 }}>
          <Link to="/" style={{ color: 'var(--gray)', textDecoration: 'none' }}>Home</Link>
          <span> / </span>
          <span style={{ color: 'var(--black)', fontWeight: 600 }}>{guide.title}</span>
        </div>

        <div className="section-header" style={{ textAlign: 'left' }}>
          <div className="section-title">{guide.title}</div>
          <div className="section-sub">{guide.intro}</div>
        </div>

        {guide.shopLink && (
          <Link to={guide.shopLink.to} className="btn-primary" style={{ display: 'inline-flex', marginBottom: 28 }}>
            {guide.shopLink.label} <ArrowIcon />
          </Link>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {guide.qa.map((item, i) => (
            <div key={i} className="adm-table-wrap" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{item.q}</div>
              <div style={{ fontSize: 13.5, color: 'var(--gray)', lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>

        {guide.shopLink && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to={guide.shopLink.to} className="btn-primary">{guide.shopLink.label} <ArrowIcon /></Link>
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1.5px solid var(--gray-lt)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>More Knowledge Hub Guides</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.keys(knowledgeHub).filter(s => s !== slug).map(s => (
              <Link key={s} to={`/learn/${s}`} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gray)', border: '1.5px solid var(--gray-lt)', borderRadius: 20, padding: '6px 14px', textDecoration: 'none' }}>
                {knowledgeHub[s].title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
