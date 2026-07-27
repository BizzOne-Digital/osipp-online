import { Link } from 'react-router-dom';
import { ArrowIcon } from '../../components/Icons';

export default function About() {
  const stores = [
    ['Beer Store', 'All major brands, craft beers, cases and singles'],
    ['Liquor Store', 'Spirits, wine, champagne, pre-mixed cocktails'],
    ['Convenience Store', 'Snacks, mixers, ice, party supplies and essentials'],
  ];

  return (
    <>
      <div className="about-hero">
        <div className="container">
          <div style={{ maxWidth: 580 }}>
            <div className="hero-eyebrow" style={{ background: 'rgba(196,133,58,.12)', border: '1px solid rgba(196,133,58,.3)', color: 'var(--gold-dk)' }}>Our Story</div>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
              Fast, Reliable &<br />Responsible Delivery
            </h2>
            <p style={{ fontSize: 16, color: 'var(--gray)', lineHeight: 1.7, maxWidth: 480 }}>
              O'SIPP Delivery brings your favourite beers, wines, spirits and convenience products right to your door in Mississauga, Oakville &amp; Milton. We partner with the Beer Store, Liquor Store and local convenience stores. 19+ ID required at delivery.
            </p>
          </div>
          <div className="about-stats">
            {[['1hr', 'Delivery Time'], ['$13', 'Flat Delivery Fee'], ['19+', 'ID Required']].map(([n, l]) => (
              <div key={l} className="about-stat"><div className="about-stat-num">{n}</div><div className="about-stat-lbl">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="section">
        <div className="container">
          <div className="about-content">
            <div>
              <h3 style={{ fontFamily: 'var(--font-d)', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>What We Deliver</h3>
              {stores.map(([t, d]) => (
                <div key={t} className="about-item">
                  <div className="about-dot" />
                  <div><div style={{ fontWeight: 700, marginBottom: 4 }}>{t}</div><div style={{ fontSize: 13, color: 'var(--gray)' }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div className="about-cta-box">
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Ready to Order?</div>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>Delivery starts at $4.99 — processing and handling charges apply at checkout. Delivery in about 1 hour to Mississauga, Oakville &amp; Milton.</p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginBottom: 24 }}>19+ Only. ID required. Drink responsibly.</p>
              <Link to="/products" className="btn-primary">Shop Now <ArrowIcon /></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
