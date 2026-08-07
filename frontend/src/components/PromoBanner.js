import { useState } from 'react';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'osipp_promo_banner_dismissed';

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (dismissed) return null;

  const close = () => { setDismissed(true); sessionStorage.setItem(DISMISS_KEY, '1'); };

  return (
    <div style={{ background: 'var(--black)', color: 'white', padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 12.5, textAlign: 'center', flexWrap: 'wrap', position: 'relative' }}>
      <span>
        Use code <b style={{ color: 'var(--gold)' }}>WELCOME10</b> for $10 off delivery on your first order — plus get a <b style={{ color: 'var(--gold)' }}>FREE COOLER CAN</b> with any order, while supplies last!
      </span>
      <Link to="/products" style={{ color: 'white', textDecoration: 'underline', fontWeight: 700, whiteSpace: 'nowrap' }}>Order Now</Link>
      <button onClick={close} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>✕</button>
    </div>
  );
}
