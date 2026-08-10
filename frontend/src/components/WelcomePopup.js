import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SEEN_KEY = 'osipp_welcome_popup_seen';

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => { setOpen(false); localStorage.setItem(SEEN_KEY, '1'); };
  const orderNow = () => { close(); navigate('/products'); };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && close()}>
      <div style={{ background: 'var(--black)', color: 'white', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
        <button onClick={close} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Welcome to O'SIPP</div>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 6 }}>Get <b>FREE DELIVERY</b> on Your First Order</div>
        <div style={{ display: 'inline-block', background: 'var(--gold)', color: 'var(--black)', fontWeight: 800, letterSpacing: 1, padding: '6px 16px', borderRadius: 8, margin: '8px 0 18px', fontSize: 15 }}>OSIPPFREE</div>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 4 }}>Plus, receive <b style={{ color: 'var(--gold)' }}>1 FREE COOLER CAN</b> with any order</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 22 }}>While supplies last</div>
        <button onClick={orderNow} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Order Now</button>
      </div>
    </div>
  );
}
