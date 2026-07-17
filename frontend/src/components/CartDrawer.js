import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CloseIcon, ArrowIcon, BottleSVG, MinusIcon, PlusIcon } from './Icons';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function CartDrawer({ onClose }) {
  const {
    items, updateQty, removeItem, subtotal, deliveryFee, deliveryStops, total, clearCart,
    discount, coupon, couponError, couponLoading, applyCoupon, removeCoupon,
    tip, setTip, tipEnabled, tipPresets,
    driverInstructions, setDriverInstructions,
    addOns, addAddOn, updateAddOnQty, activeAddOns
  } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', email: user?.email||'', address: user?.address||'', city: user?.city||'Mississauga', postalCode: user?.postalCode||'' });
  const [payMethod, setPayMethod] = useState('cash');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [customTip, setCustomTip] = useState('');

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) return alert('Fill required fields');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/orders`, {
        customer: form,
        items: items.map(i => ({ product: i._id, quantity: i.qty, variantIndex: i.variantIndex })),
        addOns: addOns.map(a => ({ name: a.name, quantity: a.quantity })),
        tip: parseFloat(tip) || 0,
        driverInstructions,
        paymentMethod: payMethod,
        couponCode: coupon?.code || ''
      });
      setOrderId(res.data.data.orderId);
      clearCart(); setStep('success');
    } catch (err) { alert(err.response?.data?.message || 'Order failed'); }
    setLoading(false);
  };

  const pickTip = (amt) => { setTip(amt); setCustomTip(''); };
  const onCustomTip = (v) => { setCustomTip(v); setTip(parseFloat(v) || 0); };

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
                  <input value={couponInput} onChange={e=>setCouponInput(e.target.value)} placeholder="Coupon code" style={{flex:1,padding:'8px 12px',border:'1.5px solid var(--gray-lt)',borderRadius:6,fontSize:13,outline:'none'}}/>
                  <button onClick={()=>applyCoupon(couponInput)} disabled={couponLoading||!couponInput} style={{padding:'8px 14px',background:'var(--black)',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',opacity:couponLoading?.5:1}}>Apply</button>
                </div>
              )}
              {couponError && <div style={{color:'var(--red)',fontSize:12,marginTop:4}}>{couponError}</div>}
            </div>
            <div className="cart-subtotal"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="cart-subtotal"><span>Discount</span><span style={{color:'var(--green)'}}>-${discount.toFixed(2)}</span></div>}
            {deliveryStops.length > 1
              ? deliveryStops.map(d => <div key={d.store} className="cart-subtotal"><span>Delivery · {d.store}</span><span>${d.fee.toFixed(2)}</span></div>)
              : <div className="cart-subtotal"><span>Delivery{deliveryStops[0] ? ` · ${deliveryStops[0].store}` : ''}</span><span>${deliveryFee.toFixed(2)}</span></div>}
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

        {step === 'payment' && <div style={{padding:24,flex:1,overflowY:'auto'}}>
          <div className="order-summary-mini">
            <div className="order-summary-mini-title">Summary</div>
            {items.map(i=><div key={i.cartKey} className="order-line"><span>{i.name}{i.variantLabel?` (${i.variantLabel})`:''} x{i.qty}</span><span>${(i.price*i.qty).toFixed(2)}</span></div>)}
            {addOns.map(a=><div key={a.name} className="order-line"><span>{a.name} x{a.quantity}</span><span>${(a.price*a.quantity).toFixed(2)}</span></div>)}
            {discount>0 && <div className="order-line" style={{color:'var(--green)'}}><span>Coupon ({coupon?.code})</span><span>-${discount.toFixed(2)}</span></div>}
            {deliveryStops.length > 1
              ? deliveryStops.map(d => <div key={d.store} className="order-line"><span>Delivery · {d.store}</span><span>${d.fee.toFixed(2)}</span></div>)
              : <div className="order-line"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>}
            {(parseFloat(tip)||0) > 0 && <div className="order-line"><span>Driver tip</span><span>${(parseFloat(tip)||0).toFixed(2)}</span></div>}
            <div className="order-line-bold"><span>Total</span><span style={{color:'var(--gold-dk)'}}>${total.toFixed(2)}</span></div>
          </div>

          {tipEnabled && (
            <div style={{marginBottom:18}}>
              <div className="form-label" style={{marginBottom:10}}>Tip for the driver</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button onClick={()=>pickTip(0)} style={tipBtn(!customTip && (parseFloat(tip)||0)===0)}>No tip</button>
                {tipPresets.map(t=>(
                  <button key={t} onClick={()=>pickTip(t)} style={tipBtn(!customTip && (parseFloat(tip)||0)===t)}>${t}</button>
                ))}
                <input value={customTip} onChange={e=>onCustomTip(e.target.value)} type="number" min="0" placeholder="Custom $" style={{width:90,padding:'8px 10px',border:'1.5px solid var(--gray-lt)',borderRadius:6,fontSize:13,outline:'none'}}/>
              </div>
            </div>
          )}

          <div className="form-label" style={{marginBottom:10}}>Payment Method</div>
          <div className="payment-options">
            {['cash','card','interac'].map(m=>(<div key={m} className={`pay-opt${payMethod===m?' selected':''}`} onClick={()=>setPayMethod(m)}><div className="pay-opt-name">{m==='cash'?'Cash on Delivery':m==='card'?'Credit / Debit':'Interac e-Transfer'}</div></div>))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}><button className="btn-outline" style={{flex:1,justifyContent:'center'}} onClick={()=>setStep('details')}>Back</button><button className="btn-checkout" style={{flex:2}} onClick={placeOrder} disabled={loading}>{loading?'Placing...': `Place Order · $${total.toFixed(2)}`}</button></div>
          <p style={{fontSize:12,color:'var(--gray)',textAlign:'center',marginTop:10}}>If your product is not here, please let us know by text or call.</p>
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
