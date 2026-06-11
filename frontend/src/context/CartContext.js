import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [coupon, setCoupon] = useState(null); // { code, discount, description }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const addItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i._id !== id)), []);

  const updateQty = useCallback((id, delta) => {
    setItems(prev => prev.map(i => {
      if (i._id !== id) return i;
      const q = i.qty + delta;
      return q < 1 ? null : { ...i, qty: q };
    }).filter(Boolean));
  }, []);

  const clearCart = useCallback(() => { setItems([]); setCoupon(null); setCouponError(''); }, []);

  const applyCoupon = useCallback(async (code) => {
    setCouponLoading(true); setCouponError('');
    try {
      const st = items.reduce((s, i) => s + i.price * i.qty, 0);
      const res = await axios.post('/api/coupons/validate', { code, subtotal: st });
      setCoupon(res.data.data);
      setCouponLoading(false);
      return true;
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid code');
      setCoupon(null);
      setCouponLoading(false);
      return false;
    }
  }, [items]);

  const removeCoupon = useCallback(() => { setCoupon(null); setCouponError(''); }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const discount = coupon ? coupon.discount : 0;
  const deliveryFee = subtotal > 0 ? 13 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      subtotal, deliveryFee, total, itemCount, discount,
      toast, coupon, couponLoading, couponError, applyCoupon, removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
