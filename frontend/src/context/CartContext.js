import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API = process.env.REACT_APP_API_URL || '/api';

// Unique line-item key so the same product in two different sizes stays separate.
const keyOf = (id, variantIndex) => `${id}::${variantIndex != null ? variantIndex : 'base'}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [settings, setSettings] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [driverInstructions, setDriverInstructions] = useState('');
  const [addOns, setAddOns] = useState([]); // [{ name, price, quantity }]

  // Load delivery/add-on/tip config once
  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data.data)).catch(() => {});
  }, []);

  // product + optional variantIndex (index into product.variants)
  const addItem = useCallback((product, variantIndex = null) => {
    const variant = variantIndex != null && product.variants ? product.variants[variantIndex] : null;
    const price = variant ? variant.price : product.price;
    const label = variant ? variant.label : (product.volume || '');
    const cartKey = keyOf(product._id, variantIndex);
    setItems(prev => {
      const exists = prev.find(i => i.cartKey === cartKey);
      if (exists) return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, cartKey, variantIndex, price, variantLabel: label, qty: 1 }];
    });
    setToast(`${product.name}${variant ? ` (${variant.label})` : ''} added to cart`);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const removeItem = useCallback((cartKey) => setItems(prev => prev.filter(i => i.cartKey !== cartKey)), []);
  const updateQty = useCallback((cartKey, delta) => {
    setItems(prev => prev.map(i => { if (i.cartKey !== cartKey) return i; const q = i.qty + delta; return q < 1 ? null : { ...i, qty: q }; }).filter(Boolean));
  }, []);
  const clearCart = useCallback(() => { setItems([]); setCoupon(null); setCouponError(''); setTip(0); setDriverInstructions(''); setAddOns([]); }, []);

  // ── Add-ons ──
  const addAddOn = useCallback((addOn) => {
    setAddOns(prev => {
      const exists = prev.find(a => a.name === addOn.name);
      if (exists) return prev.map(a => a.name === addOn.name ? { ...a, quantity: a.quantity + 1 } : a);
      return [...prev, { name: addOn.name, price: addOn.price, quantity: 1 }];
    });
  }, []);
  const updateAddOnQty = useCallback((name, delta) => {
    setAddOns(prev => prev.map(a => a.name === name ? { ...a, quantity: a.quantity + delta } : a).filter(a => a.quantity > 0));
  }, []);

  const applyCoupon = useCallback(async (code) => {
    setCouponLoading(true); setCouponError('');
    try {
      const st = items.reduce((s, i) => s + i.price * i.qty, 0);
      const res = await axios.post(`${API}/coupons/validate`, { code, subtotal: st });
      setCoupon(res.data.data); setCouponLoading(false); return true;
    } catch (err) { setCouponError(err.response?.data?.message || 'Invalid code'); setCoupon(null); setCouponLoading(false); return false; }
  }, [items]);

  const removeCoupon = useCallback(() => { setCoupon(null); setCouponError(''); }, []);

  // ── Totals ──
  const itemsSubtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const addOnsSubtotal = addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const subtotal = itemsSubtotal + addOnsSubtotal;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const discount = coupon ? coupon.discount : 0;

  // Delivery fee by distinct store stops (mirror of the server calculation)
  const feeMap = settings?.storeDeliveryFees || {};
  const useStops = settings ? settings.useStopBasedDelivery : true;
  const flatFee = settings?.deliveryFee != null ? settings.deliveryFee : 13;
  const distinctStores = [...new Set(items.map(i => i.store).filter(Boolean))];
  const deliveryStops = distinctStores.map(store => ({
    store,
    fee: feeMap[store] != null ? feeMap[store] : flatFee
  }));
  let deliveryFee = 0;
  if (subtotal > 0) {
    deliveryFee = useStops ? deliveryStops.reduce((s, d) => s + d.fee, 0) : flatFee;
  }

  const total = Math.max(0, subtotal - discount + deliveryFee + (parseFloat(tip) || 0));

  const activeAddOns = (settings?.addOns || []).filter(a => a.isActive);
  const tipEnabled = settings ? settings.tipEnabled : true;
  const tipPresets = settings?.tipPresets || [3, 5, 10];

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      cartOpen, openCart, closeCart,
      subtotal, deliveryFee, deliveryStops, total, itemCount, discount,
      toast, coupon, couponLoading, couponError, applyCoupon, removeCoupon,
      tip, setTip, tipEnabled, tipPresets,
      driverInstructions, setDriverInstructions,
      addOns, addAddOn, updateAddOnQty, activeAddOns, addOnsSubtotal,
      settings
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
