import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CloseIcon, ArrowIcon, BottleSVG, MinusIcon, PlusIcon } from './Icons';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function CartDrawer({ onClose }) {
  const {
    items, updateQty, removeItem, subtotal, deliveryFee, deliveryTier, deliveryStops, getTotals, cardFeePercent, hasTobacco, clearCart,
    discount, coupon, couponError, couponLoading, applyCoupon, removeCoupon,
    tip, setTip, tipEnabled, tipPresets,
    driverInstructions, setDriverInstructions,
    deliveryTiming, setDeliveryTiming, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime,
    addOns, addAddOn, updateAddOnQty, activeAddOns
  } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', email: user?.email||'', address: user?.address||'', city: user?.city||'Mississauga', postalCode: user?.postalCode||'' });
  // Tobacco/smoke orders can't be paid cash on delivery — default them straight to card.
  const [payMethod, setPayMethod] = useState(hasTobacco ? 'stripe' : 'cash');
  // Cart contents (and hasTobacco) can change after this component already mounted —
  // e.g. a tobacco item added while the drawer is open — so re-sync away from cash/interac
  // whenever that happens, instead of leaving the initial useState value stuck.
  useEffect(() => {
    if (hasTobacco && !['stripe', 'card'].includes(payMethod)) setPayMethod('stripe');
  }, [hasTobacco, payMethod]);
  const { handlingFee, total } = getTotals(payMethod);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [customTip, setCustomTip] = useState('');

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) return alert('Fill required fields');
    if (hasTobacco && !['stripe','card'].includes(payMethod)) return alert('Smoke/tobacco orders require advance payment by card — cash and e-transfer are not accepted for these orders.');
    if (deliveryTiming === 'scheduled' && (!scheduledDate || !scheduledTime)) return alert('Please choose a delivery date and time');
    setLoading(true);
    const orderBody = {
      customer: form,
      items: items.map(i => ({ product: i._id, quantity: i.qty, variantIndex: i.variantIndex })),
      addOns: addOns.map(a => ({ name: a.name, quantity: a.quantity })),
      tip: parseFloat(tip) || 0,
      driverInstructions,
      deliveryTiming, scheduledDate, scheduledTime,
      couponCode: coupon?.code || ''
    };
    try {
      if (payMethod === 'stripe') {
        const res = await axios.post(`${API}/payments/create-checkout-session`, orderBody);
        window.location.href = res.data.url; // redirect to Stripe Checkout; cart clears on return
        return;
      }
      const res = await axios.post(`${API}/orders`, { ...orderBody, paymentMethod: payMethod });
      setOrderId(res.data.data.orderId);
      clearCart(); setStep('success');
    } catch (err) { alert(err.response?.data?.message || 'Order failed'); }
    setLoading(false);
  };

  // Tips are chosen as a % of subtotal, then converted to a dollar amount for the
  // actual `tip` total (which the backend/getTotals expects as a flat dollar figure).
  const [tipPercent, setTipPercent] = useState(0);
  const pctToDollars = (pct) => Math.round(subtotal * pct / 100 * 100) / 100;
  const pickTipPercent = (pct) => { setTipPercent(pct); setCustomTip(''); setTip(pctToDollars(pct)); };
  // Default the tip to 10% (not "No Tip") as soon as we know the subtotal and presets —
  // only once, so it doesn't override a tip the customer already picked themselves.
  const defaultTipSet = useRef(false);
  useEffect(() => {
    if (!defaultTipSet.current && tipEnabled && subtotal > 0) {
      defaultTipSet.current = true;
      const defaultPct = tipPresets.includes(10) ? 10 : (tipPresets[0] || 10);
      setTipPercent(defaultPct);
      setTip(Math.round(subtotal * defaultPct / 100 * 100) / 100);
    }
  }, [tipEnabled, subtotal, tipPresets, setTip]);
  const onCustomTip = (v) => {
    setCustomTip(v);
    const pct = parseFloat(v) || 0;
    setTipPercent(pct);
    setTip(pctToDollars(pct));
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose}/>
      <div className="cart-drawer">
        <div className="cart-head">
          <div className="cart-head-title">{step==='cart'?'Your Cart':step==='details'?'Delivery Details':step==='payment'?'Payment':'Order Placed!'}</div>
          <button className="btn-close" onClick={onClose}><CloseIcon/></button>
        </div>

        {step === 'cart' && <>
          <div className="cart-items">
            {items.length === 0 ? <div className="cart-empty"><div style={{fontWeight:600,marginBottom:6}}>Your cart is empty</div></div>
            : items.map(i => (
              <div key={i.cartKey} className="cart-item">
                <div className="cart-item-img">{i.image ? <img src={i.image} alt={i.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'var(--r-sm)'}}/> : <BottleSVG cat={i.category}/>}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{i.name}</div>
                  <div className="cart-item-vol">{i.variantLabel || i.volume}{i.store ? ` · ${i.store}` : ''}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={()=>i.qty===1?removeItem(i.cartKey):updateQty(i.cartKey,-1)}><MinusIcon/></button>
                      <span className="qty-num">{i.qty}</span>
                      <button className="qty-btn" onClick={()=>updateQty(i.cartKey,1)}><PlusIcon/></button>
                    </div>
                    <div className="cart-item-price">${(i.price*i.qty).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add-ons (e.g. pack of smokes, ice) */}
            {items.length > 0 && activeAddOns.length > 0 && (
              <div style={{marginTop:18,paddingTop:16,borderTop:'1px solid var(--gray-lt)'}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Add extras</div>
                {activeAddOns.map(a => {
                  const inCart = addOns.find(x => x.name === a.name);
                  return (
                    <div key={a.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                      <div><div style={{fontSize:13,fontWeight:600}}>{a.name}</div><div style={{fontSize:12,color:'var(--gray)'}}>${a.price.toFixed(2)}</div></div>
                      {inCart ? (
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={()=>updateAddOnQty(a.name,-1)}><MinusIcon/></button>
                          <span className="qty-num">{inCart.quantity}</span>
                          <button className="qty-btn" onClick={()=>updateAddOnQty(a.name,1)}><PlusIcon/></button>
                        </div>
                      ) : (
                        <button onClick={()=>addAddOn(a)} style={{padding:'6px 14px',background:'var(--black)',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>Add</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {items.length > 0 && <div className="cart-footer">
            <div style={{marginBottom:14}}>
              {coupon ? (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--cream)',padding:'8px 12px',borderRadius:8,fontSize:13}}>
                  <span><strong style={{color:'var(--green)'}}>✓ {coupon.code}</strong> — -${discount.toFixed(2)} off</span>
                  <button onClick={removeCoupon} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:16}}>×</button>
                </div>
              ) : (
                <div style={{display:'flex',gap:8}}>
                  <input value={couponInput} onChange={e=>setCouponInput(e.target.value)} placeholder="Coupon code" style={{flex:1,padding:'8px 12px',border:'1.5px solid var(--gray-lt)',borderRadius:6,fontSize:16,outline:'none'}}/>
                  <button onClick={()=>applyCoupon(couponInput)} disabled={couponLoading||!couponInput} style={{padding:'8px 14px',background:'var(--black)',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',opacity:couponLoading?.5:1}}>Apply</button>
                </div>
              )}
              {couponError && <div style={{color:'var(--red)',fontSize:12,marginTop:4}}>{couponError}</div>}
            </div>
            <div className="cart-subtotal"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="cart-subtotal"><span>Discount</span><span style={{color:'var(--green)'}}>-${discount.toFixed(2)}</span></div>}
            <div className="cart-subtotal"><span>Delivery{deliveryStops.length ? ` · ${deliveryStops.map(d=>d.store).join(', ')}` : ''}</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="cart-subtotal"><span>Processing &amp; Handling</span><span>${handlingFee.toFixed(2)}</span></div>
            <div className="cart-total"><span className="cart-total-lbl">Total</span><span className="cart-total-val">${total.toFixed(2)}</span></div>
            <button className="btn-checkout" onClick={()=>setStep('details')}>Checkout <ArrowIcon/></button>
          </div>}
        </>}

        {step === 'details' && <div style={{padding:24,flex:1,overflowY:'auto'}}>
          <div className="form-row"><div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e=>upd('name',e.target.value)}/></div><div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e=>upd('phone',e.target.value)}/></div></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>upd('email',e.target.value)} type="email"/></div>
          <div className="form-group"><label className="form-label">Delivery Address *</label><input className="form-input" value={form.address} onChange={e=>upd('address',e.target.value)}/></div>
          <div className="form-row"><div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e=>upd('city',e.target.value)}/></div><div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" value={form.postalCode} onChange={e=>upd('postalCode',e.target.value)}/></div></div>
          <div className="form-group">
            <label className="form-label">Instructions for the driver</label>
            <textarea className="form-input" value={driverInstructions} onChange={e=>setDriverInstructions(e.target.value)} rows={3} placeholder="e.g. Buzz apartment 204, leave at door, call on arrival..." style={{resize:'vertical'}}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}><button className="btn-outline" style={{flex:1,justifyContent:'center'}} onClick={()=>setStep('cart')}>Back</button><button className="btn-checkout" style={{flex:2}} onClick={()=>setStep('payment')}>Payment <ArrowIcon/></button></div>
        </div>}

        {step === 'payment' && <div style={{padding:'16px 20px',flex:1,overflowY:'auto'}}>
          <div className="order-summary-mini">
            <div className="order-summary-mini-title">Summary</div>
            {items.map(i=><div key={i.cartKey} className="order-line"><span>{i.name}{i.variantLabel?` (${i.variantLabel})`:''} x{i.qty}</span><span>${(i.price*i.qty).toFixed(2)}</span></div>)}
            {addOns.map(a=><div key={a.name} className="order-line"><span>{a.name} x{a.quantity}</span><span>${(a.price*a.quantity).toFixed(2)}</span></div>)}
            {discount>0 && <div className="order-line" style={{color:'var(--green)'}}><span>Coupon ({coupon?.code})</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="order-line"><span>Delivery{deliveryStops.length ? ` · ${deliveryStops.map(d=>d.store).join(', ')}` : ''}</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="order-line"><span>Processing &amp; Handling</span><span>${handlingFee.toFixed(2)}</span></div>
            {(parseFloat(tip)||0) > 0 && <div className="order-line"><span>Driver tip</span><span>${(parseFloat(tip)||0).toFixed(2)}</span></div>}
            <div className="order-line-bold"><span>Total</span><span style={{color:'var(--gold-dk)'}}>${total.toFixed(2)}</span></div>
          </div>

          {tipEnabled && (
            <div style={{marginBottom:12}}>
              <div className="form-label" style={{marginBottom:6}}>Tip for the driver</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {tipPresets.map(pct=>(
                  <button key={pct} onClick={()=>pickTipPercent(pct)} style={tipBtn(!customTip && tipPercent===pct)}>{pct}%</button>
                ))}
                <input value={customTip} onChange={e=>onCustomTip(e.target.value)} type="number" min="0" placeholder="Custom %" style={{width:90,padding:'8px 10px',border:'1.5px solid var(--gray-lt)',borderRadius:6,fontSize:16,outline:'none'}}/>
                <button onClick={()=>pickTipPercent(0)} style={tipBtn(!customTip && tipPercent===0)}>No Tip</button>
              </div>
              {tipPercent > 0 && <div style={{fontSize:11,color:'var(--gray)',marginTop:6}}>{tipPercent}% = ${(parseFloat(tip)||0).toFixed(2)}</div>}
            </div>
          )}

          <div className="form-label" style={{marginBottom:6}}>Delivery Timing</div>
          <div className="payment-options" style={{marginBottom:12}}>
            <div className={`pay-opt${deliveryTiming==='asap'?' selected':''}`} onClick={()=>setDeliveryTiming('asap')}><div className="pay-opt-name">ASAP</div></div>
            <div className={`pay-opt${deliveryTiming==='scheduled'?' selected':''}`} onClick={()=>setDeliveryTiming('scheduled')}><div className="pay-opt-name">Schedule Delivery</div></div>
          </div>
          {deliveryTiming === 'scheduled' && (
            <div className="form-row" style={{marginBottom:8}}>
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={scheduledTime} onChange={e=>setScheduledTime(e.target.value)}/></div>
            </div>
          )}

          <div className="form-label" style={{marginBottom:6}}>Payment Method</div>
          {hasTobacco && <p style={{fontSize:12,color:'var(--red, #b91c1c)',marginBottom:8}}>Your order includes a smoke/tobacco item — advance payment by card is required (no cash, no e-transfer), as it can't be returned once purchased.</p>}
          <div className="payment-options">
            {(hasTobacco ? ['stripe','card'] : ['cash','stripe','card','interac']).map(m=>(<div key={m} className={`pay-opt${payMethod===m?' selected':''}`} onClick={()=>setPayMethod(m)}><div className="pay-opt-name">{m==='cash'?'Cash on Delivery':m==='stripe'?'Pay Online (Card)':m==='card'?'Card (Tap at Door)':'Interac e-Transfer'}</div></div>))}
          </div>
          {(payMethod==='stripe' || payMethod==='card') && <p style={{fontSize:11,color:'var(--gray)',marginTop:6}}>A {cardFeePercent}% processing fee applies to card/tap payments (included in Processing &amp; Handling above). No fee on cash or e-transfer.</p>}
          <div style={{display:'flex',gap:10,marginTop:12}}><button className="btn-outline" style={{flex:1,justifyContent:'center'}} onClick={()=>setStep('details')}>Back</button><button className="btn-checkout" style={{flex:2}} onClick={placeOrder} disabled={loading}>{loading?(payMethod==='stripe'?'Redirecting...':'Placing...'): payMethod==='stripe'?`Pay $${total.toFixed(2)}`:`Place Order · $${total.toFixed(2)}`}</button></div>
          <p style={{fontSize:11,color:'var(--gray)',textAlign:'center',marginTop:8}}>If your product is not here, please let us know by text or call.</p>
        </div>}

        {step === 'success' && <div className="success-screen" style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{margin:'0 auto 20px'}}><circle cx="36" cy="36" r="36" fill="#DCFCE7"/><path d="M22 36l10 10 18-18" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div className="success-title">Order Placed!</div>
          <p className="success-sub">Delivery in about 1 hour. 19+ ID required.</p>
          <div className="order-id">{orderId}</div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={onClose}>Continue Shopping</button>
        </div>}
      </div>
    </>
  );
}

const tipBtn = (active) => ({
  padding:'8px 16px', border:`1.5px solid ${active?'var(--gold-dk, #b8860b)':'var(--gray-lt)'}`,
  background: active?'var(--gold-dk, #b8860b)':'white', color: active?'white':'var(--black)',
  borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer'
});
