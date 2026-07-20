import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const API = process.env.REACT_APP_API_URL || '/api';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => { clearCart(); }, [clearCart]);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    let tries = 0;
    const poll = async () => {
      try {
        const res = await axios.get(`${API}/orders/track/${orderId}`);
        setOrder(res.data.data);
        // Stripe webhook can land a second or two after the redirect — poll briefly until paid.
        if (res.data.data.paymentStatus !== 'paid' && tries < 6) {
          tries += 1;
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    poll();
  }, [orderId]);

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto 20px' }}>
        <circle cx="36" cy="36" r="36" fill="#DCFCE7" />
        <path d="M22 36l10 10 18-18" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 style={{ marginBottom: 8 }}>{loading ? 'Confirming payment...' : order?.paymentStatus === 'paid' ? 'Payment Successful!' : 'Order Received'}</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 16 }}>Delivery in about 1 hour. 19+ ID required.</p>
      {orderId && <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>{orderId}</div>}
      <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>Continue Shopping</Link>
    </div>
  );
}
