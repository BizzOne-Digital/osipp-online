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
  const [deliveryTiming, setDeliveryTiming] = useState('asap'); // 'asap' | 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Load delivery/add-on/tip config once
  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data.data)).catch(() => {});
  }, []);

  // product + optional variantIndex (index into product.variants)
  const addItem = useCallback((product, variantIndex = null) => {
    const variant = variantIndex != null && product.variants ? product.variants[variantIndex] : null;
    const price = variant ? variant.price : product.price;
    const label = variant ? variant.label : (product.volume || '');
    // A size can be picked up from a different store than the product's default
    // (e.g. a 24-pack sourced from the Beer Store while other sizes ship from Liquor Store).
    const store = (variant && variant.store) ? variant.store : product.store;
    const cartKey = keyOf(product._id, variantIndex);
    setItems(prev => {
      const exists = prev.find(i => i.cartKey === cartKey);
      if (exists) return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, cartKey, variantIndex, price, variantLabel: label, store, qty: 1 }];
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
  const clearCart = useCallback(() => { setItems([]); setCoupon(null); setCouponError(''); setTip(0); setDriverInstructions(''); setAddOns([]); setDeliveryTiming('asap'); setScheduledDate(''); setScheduledTime(''); }, []);

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

  // Delivery fee tier — mirror of the server calculation in backend/utils/orderBuilder.js.
  // Server is authoritative; this is only a live estimate for the cart UI.
  const DELIVERY_TIERS = {
    regular: { delivery: 4.99, handling: 7.99 },
    multiStop: { delivery: 6.99, handling: 10.99 },
    alcoholBeer: { delivery: 8.99, handling: 12.99 },
    largeHeavy: { delivery: 11.99, handling: 15.99 }
  };
  const parseLiters = (label) => {
    if (!label) return 0;
    const m = String(label).toLowerCase().match(/([\d.]+)\s*(ml|l)\b/);
    if (!m) return 0;
    const val = parseFloat(m[1]);
    return m[2] === 'l' ? val : val / 1000;
  };
  const distinctStores = [...new Set(items.map(i => i.store).filter(Boolean))];
  let bottle750Count = 0, largeBottleCount = 0, beer24Count = 0, beer12Count = 0;
  for (const i of items) {
    const label = (i.variantLabel || i.volume || '').toLowerCase();
    if (i.category === 'Beer' || /beer/i.test(i.store || '')) {
      if (label.includes('24')) beer24Count += i.qty;
      else if (label.includes('12')) beer12Count += i.qty;
      continue;
    }
    const liters = parseLiters(label);
    if (liters >= 1.14) largeBottleCount += i.qty; else bottle750Count += i.qty;
  }
  let deliveryTier = 'regular';
  if (largeBottleCount >= 5 || beer24Count >= 3 || beer12Count >= 8) deliveryTier = 'largeHeavy';
  else if (distinctStores.length >= 3) deliveryTier = 'alcoholBeer';
  else if (distinctStores.length >= 2 || bottle750Count >= 5 || beer24Count >= 1) deliveryTier = 'multiStop';
  const deliveryFee = subtotal > 0 ? DELIVERY_TIERS[deliveryTier].delivery : 0;
  const baseHandlingFee = subtotal > 0 ? DELIVERY_TIERS[deliveryTier].handling : 0;
  const deliveryStops = distinctStores.map(store => ({ store, fee: null }));

  // Safety net: catches smoke/tobacco items by name even if the admin forgot to tick the
  // "Tobacco" checkbox on that specific product/add-on — mirrors backend/utils/orderBuilder.js.
  const TOBACCO_KEYWORDS = /cigarette|cigar\b|tobacco|\bsmoke(s)?\b|vape|vaping|e-?cig/i;
  const looksLikeTobacco = (name, category, subCategory) =>
    TOBACCO_KEYWORDS.test(name || '') || TOBACCO_KEYWORDS.test(category || '') || TOBACCO_KEYWORDS.test(subCategory || '');
  const hasTobacco = items.some(i => i.isTobacco || looksLikeTobacco(i.name, i.category, i.subCategory))
    || (settings?.addOns || []).some(s => (s.isTobacco || looksLikeTobacco(s.name)) && addOns.find(a => a.name === s.name));
  const cardFeePercent = settings?.cardProcessingFeePercent != null ? settings.cardProcessingFeePercent : 3.2;

  const activeAddOns = (settings?.addOns || []).filter(a => a.isActive);
  const tipEnabled = settings ? settings.tipEnabled : true;
  const tipPresets = settings?.tipPresets || [3, 5, 10];

  // Card/tap payments fold a 3.2% surcharge directly into the Processing & Handling
  // number (not a separate line) — cash/e-transfer pay the base handling fee only.
  const getTotals = useCallback((paymentMethod) => {
    const isCardTap = paymentMethod === 'card' || paymentMethod === 'stripe';
    let handlingFee = baseHandlingFee;
    if (isCardTap) {
      const preFee = Math.max(0, subtotal - discount + deliveryFee + handlingFee + (parseFloat(tip) || 0));
      handlingFee = Math.round((handlingFee + preFee * cardFeePercent / 100) * 100) / 100;
    }
    const total = Math.max(0, subtotal - discount + deliveryFee + handlingFee + (parseFloat(tip) || 0));
    return { handlingFee, total };
  }, [subtotal, discount, deliveryFee, baseHandlingFee, tip, cardFeePercent]);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      cartOpen, openCart, closeCart,
      subtotal, deliveryFee, deliveryTier, deliveryStops, getTotals, cardFeePercent, hasTobacco, itemCount, discount,
      toast, coupon, couponLoading, couponError, applyCoupon, removeCoupon,
      tip, setTip, tipEnabled, tipPresets,
      driverInstructions, setDriverInstructions,
      deliveryTiming, setDeliveryTiming, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime,
      addOns, addAddOn, updateAddOnQty, activeAddOns, addOnsSubtotal,
      settings
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
