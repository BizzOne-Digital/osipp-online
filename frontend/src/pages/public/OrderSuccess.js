import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const API = process.env.REACT_APP_API_URL || '/api';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const requestId = params.get('requestId') || '';
  const id = orderId || requestId;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => { if (orderId) clearCart(); }, [orderId, clearCart]);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let tries = 0;
    const endpoint = orderId ? `${API}/orders/track/${id}` : `${API}/services/track/${id}`;
    const poll = async () => {
      try {
        const res = await axios.get(endpoint);
        setRecord(res.data.data);
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
  }, [id, orderId]);

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto 20px' }}>
        <circle cx="36" cy="36" r="36" fill="#DCFCE7" />
        <path d="M22 36l10 10 18-18" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 style={{ marginBottom: 8 }}>{loading ? 'Confirming payment...' : record?.paymentStatus === 'paid' ? 'Payment Successful!' : 'Order Received'}</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 16 }}>{orderId ? 'Delivery in about 1 hour. 19+ ID required.' : 'Our team will be in touch shortly to confirm your request.'}</p>
      {id && <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>{id}</div>}
      <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>Continue Shopping</Link>
    </div>
  );
}
