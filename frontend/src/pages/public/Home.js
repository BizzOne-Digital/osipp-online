import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { SearchIcon, ArrowIcon, TruckIcon, CartIcon, MapPinIcon, WhatsAppIcon, ShieldIcon, PhoneIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

/* ── Category SVGs ── */
const CatBeer = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="14" y="16" width="30" height="44" rx="6" fill="#F5D78E"/>
    <rect x="14" y="16" width="30" height="16" rx="4" fill="#FFF8EB" opacity=".7"/>
    <rect x="44" y="24" width="10" height="22" rx="5" fill="#E8C85A"/>
    <rect x="44" y="24" width="10" height="8" rx="5" fill="#F5E6A8" opacity=".5"/>
    <path d="M22 42h14" stroke="#C8A020" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 48h10" stroke="#C8A020" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
  </svg>
);
const CatSpirits = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="28" y="6" width="16" height="10" rx="4" fill="#8AAEE8" opacity=".7"/>
    <path d="M24 16h24l3 10H21l3-10z" fill="#B8C8F0" opacity=".6"/>
    <rect x="18" y="26" width="36" height="38" rx="8" fill="#B8C8F0"/>
    <rect x="18" y="26" width="36" height="14" rx="6" fill="#D0DBEF" opacity=".6"/>
    <rect x="24" y="44" width="24" height="14" rx="3" fill="white" opacity=".3"/>
    <path d="M28 50h16" stroke="#6B8FDD" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 55h12" stroke="#6B8FDD" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
  </svg>
);
const CatWine = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <path d="M28 8h16v22c0 10 10 14 10 14H18s10-4 10-14V8z" fill="#9B4D6E"/>
    <path d="M28 8h16v12c0 0-4 6-8 6s-8-6-8-6V8z" fill="#C06888" opacity=".5"/>
    <rect x="33" y="44" width="6" height="14" rx="1.5" fill="#9B4D6E" opacity=".8"/>
    <rect x="26" y="58" width="20" height="5" rx="2.5" fill="#9B4D6E" opacity=".6"/>
  </svg>
);
const CatStore = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="10" y="30" width="52" height="34" rx="4" fill="#7DCBA4"/>
    <path d="M6 30l6-18h48l6 18H6z" fill="#5AB88A"/>
    <rect x="14" y="14" width="8" height="6" rx="3" fill="#4AA87A"/>
    <rect x="50" y="14" width="8" height="6" rx="3" fill="#4AA87A"/>
    <rect x="32" y="14" width="8" height="6" rx="3" fill="#4AA87A"/>
    <rect x="28" y="42" width="16" height="22" rx="3" fill="white" opacity=".6"/>
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API}/products?limit=8&badge=Popular`).then(r => setFeatured(r.data.data)).catch(() => {});
    axios.get(`${API}/promotions?active=true`).then(r => setPromotions(r.data.data || [])).catch(() => {});
  }, []);

  const cats = [
    { label: 'Beer', cls: 'beer', icon: <CatBeer />, sub: 'Lagers, Ales, Stouts & Craft', store: 'Beer Store' },
    { label: 'Spirits', cls: 'spirits', icon: <CatSpirits />, sub: 'Whiskey, Vodka, Rum, Gin', store: 'Liquor Store' },
    { label: 'Wine', cls: 'wine', icon: <CatWine />, sub: 'Red, White, Rosé, Champagne', store: 'Liquor Store' },
    { label: 'Convenience', cls: 'store', icon: <CatStore />, sub: 'Snacks, Mixers, Ice, Cups', store: 'Convenience Store' },
  ];

  return (
    <>
      {/* ── Promo Banner ── */}
      {promotions.length > 0 && (
        <div style={{ background: 'var(--gold)', color: 'white', textAlign: 'center', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
          {promotions[0].title} — {promotions[0].description}
        </div>
      )}

      {/* ── Hero (White/Cream) ── */}
      <div className="hero fade-up">
        <img
          src={process.env.PUBLIC_URL + '/images/hero-banner.png'}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.12, pointerEvents: 'none', zIndex: 0
          }}
        />
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
              Delivering in Mississauga & GTA
            </div>
            <h1 className="hero-title">
              Alcohol Delivery<br />Service <span className="gold">In Your City</span>
            </h1>
            <p className="hero-subtitle">
              Beer, wine, spirits & convenience store products delivered to your door in about 40 minutes. 19+ ID required at delivery.
            </p>
            <div className="hero-ctas">
              <Link to="/products" className="btn-primary">Shop Now <ArrowIcon /></Link>
              <button className="btn-wa" style={{ padding: '13px 22px', fontSize: 15 }}
                onClick={() => window.open('https://wa.me/19054622160', '_blank')}>
                <WhatsAppIcon /> Order via WhatsApp
              </button>
            </div>

            {/* Trust Badges - Flyer Style */}
            <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
              {[
                { icon: <TruckIcon />, title: '$13 Delivery', sub: 'Taxes included' },
                { icon: <PhoneIcon />, title: '905-462-2160', sub: 'Call or text' },
                { icon: <MapPinIcon />, title: '40 Minutes', sub: 'Fast delivery' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    border: '2px solid var(--gold)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0
                  }}>{b.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--black)' }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray)' }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div style={{
              background: 'white', border: '2px solid var(--gold)', borderRadius: 16,
              padding: 28, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.08)'
            }}>
              <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="O'SIPP" style={{ height: 80, marginBottom: 16 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dk)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Alcohol Delivery Service
              </div>
              <div style={{
                background: 'var(--cream)', borderRadius: 10, padding: '14px 20px', marginBottom: 14,
                border: '1px solid var(--gray-lt)', fontSize: 13, color: 'var(--gray)', lineHeight: 1.7
              }}>
                <strong style={{ color: 'var(--gold-dk)' }}>19+ ID Required at Delivery</strong><br />
                Drink Responsibly
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ l: 'Fast', i: <TruckIcon /> }, { l: 'Reliable', i: <ShieldIcon /> }, { l: 'Responsible', i: <MapPinIcon /> }].map((t, i) => (
                  <div key={i} style={{
                    flex: 1, padding: '10px 6px', borderRadius: 8, background: 'var(--cream)',
                    textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gold-dk)',
                    textTransform: 'uppercase', letterSpacing: 0.3
                  }}>
                    <div style={{ color: 'var(--gold)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{t.i}</div>
                    {t.l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="search-section">
        <div className="container">
          <div className="search-wrap hero-search">
            <SearchIcon />
            <input className="search-input" placeholder="Search for beer, wine, spirits, snacks..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/products?search=${search}`)} />
            <button className="btn-search" onClick={() => navigate(`/products?search=${search}`)}><SearchIcon /> Search</button>
          </div>
        </div>
      </div>

      {/* ── Trust Bar ── */}
      <div style={{ background: 'white', padding: '18px 0', borderTop: '1px solid var(--gray-lt)', borderBottom: '1px solid var(--gray-lt)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { icon: <TruckIcon />, text: '$13 Delivery (Tax Incl.)' },
            { icon: <ShieldIcon />, text: '19+ ID Verified' },
            { icon: <MapPinIcon />, text: 'Mississauga & GTA' },
            { icon: <WhatsAppIcon />, text: 'WhatsApp Support' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--gray)' }}>
              <span style={{ color: 'var(--gold)' }}>{t.icon}</span>{t.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-title">Shop by Category</div>
            <div className="section-sub">Beer Store, Liquor Store & Convenience Store</div>
          </div>
          <div className="cat-grid">
            {cats.map(c => (
              <Link key={c.label} to={`/products?cat=${c.label}`} className={`cat-card ${c.cls}`}>
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.5, marginTop: 2 }}>{c.sub}</div>
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: 'var(--gold-dk)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {c.store} <ArrowIcon />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
              <div>
                <div className="section-title">Popular Products</div>
                <div className="section-sub">Best sellers this week</div>
              </div>
              <Link to="/products" className="btn-outline">View All <ArrowIcon /></Link>
            </div>
            <div className="prod-grid">
              {featured.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="how-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-title" style={{ color: 'white' }}>How O'SIPP Works</div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 15, marginTop: 8 }}>Delivery in 4 simple steps</div>
          </div>
          <div className="how-grid">
            {[
              { n: '01', icon: <SearchIcon />, t: 'Browse & Search', d: 'Find your favourite beers, spirits, wines and more from 3 local stores.' },
              { n: '02', icon: <CartIcon />, t: 'Add to Cart', d: 'Select products, pick quantities and review your order before checkout.' },
              { n: '03', icon: <MapPinIcon />, t: 'Enter Address', d: 'Provide your Mississauga/GTA address. Choose cash, card or Interac.' },
              { n: '04', icon: <TruckIcon />, t: '40 Min Delivery', d: 'We pick, pack and deliver to your door. 19+ ID required at delivery.' },
            ].map(s => (
              <div key={s.n} className="how-step">
                <div className="how-num">{s.n}</div>
                <div className="how-step-icon">{s.icon}</div>
                <div className="how-step-title">{s.t}</div>
                <div className="how-step-text">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{ background: 'var(--cream)', padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12 }}>
            Ready to Order?
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Call or text <strong>905-462-2160</strong> or order online. $13 delivery (taxes included). Delivery in about 40 minutes to Mississauga & GTA.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/products" className="btn-primary" style={{ padding: '15px 32px', fontSize: 16 }}>Browse Products <ArrowIcon /></Link>
            <button className="btn-wa" style={{ padding: '15px 24px', fontSize: 14 }}
              onClick={() => window.open('https://wa.me/19054622160', '_blank')}>
              <WhatsAppIcon /> Order on WhatsApp
            </button>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--gray)' }}>
            19+ Only. Valid government ID required at delivery. Drink responsibly.
          </div>
        </div>
      </div>
    </>
  );
}
