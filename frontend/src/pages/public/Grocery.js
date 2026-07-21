import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

const card = (active) => ({
  border: `2px solid ${active ? 'var(--gold)' : 'var(--gray-lt)'}`,
  background: active ? 'var(--cream)' : 'white',
  borderRadius: 14, padding: '22px 20px', cursor: 'pointer', textAlign: 'left',
  transition: 'all .15s', width: '100%'
});

export default function Grocery() {
  const { user } = useAuth();
  // step: type -> plan -> member(only monthly) -> form/signup -> success
  const [step, setStep] = useState('type');
  const [groceryType, setGroceryType] = useState('');   // household | seniors
  const [plan, setPlan] = useState('');                 // one-time | monthly
  const [kind, setKind] = useState('grocery');          // grocery | membership
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reqId, setReqId] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: user?.address || '', city: user?.city || 'Mississauga', postalCode: user?.postalCode || '',
    unitBuzzer: '', orderNumber: '', storeName: '', storeAddress: '',
    items: '', preferredDate: '', preferredTime: '', deliveryTiming: 'asap', frequency: 'weekly', giftDetails: '', notes: ''
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const reset = () => { setStep('type'); setGroceryType(''); setPlan(''); setKind('grocery'); setIsMember(false); };

  const submit = async () => {
    if (!form.name || !form.phone) return alert('Please enter your name and phone');
    if (kind === 'grocery' && !form.address) return alert('Please enter your delivery/pickup address');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/services`, {
        kind, groceryType, plan, isMember,
        frequency: plan === 'monthly' ? form.frequency : '',
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, unitBuzzer: form.unitBuzzer, city: form.city, postalCode: form.postalCode },
        orderNumber: form.orderNumber, storeName: form.storeName, storeAddress: form.storeAddress,
        items: form.items, giftDetails: form.giftDetails,
        deliveryTiming: form.deliveryTiming, preferredDate: form.preferredDate, preferredTime: form.preferredTime,
        notes: form.notes
      });
      setReqId(res.data.data.requestId);
      setStep('success');
    } catch (err) { alert(err.response?.data?.message || 'Could not submit request'); }
    setLoading(false);
  };

  const typeLabel = groceryType === 'seniors' ? 'Seniors' : 'Household';

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="section-title">Grocery Pickup &amp; Delivery</div>
          <div className="section-sub">We shop, pick up and deliver to your door across Mississauga &amp; GTA.</div>
        </div>

        {/* progress hint */}
        {step !== 'success' && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'var(--gray)', margin: '8px 0 24px' }}>
            {groceryType && <span style={{ background: 'var(--cream)', padding: '4px 12px', borderRadius: 99, fontWeight: 600 }}>{typeLabel}</span>}
            {plan && <span style={{ background: 'var(--cream)', padding: '4px 12px', borderRadius: 99, fontWeight: 600 }}>{plan === 'one-time' ? 'One-time Pickup' : 'Monthly Plan'}</span>}
          </div>
        )}

        {/* STEP 1: type */}
        {step === 'type' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <button style={card(false)} onClick={() => { setGroceryType('household'); setStep('plan'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Household Grocery Pickup</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Everyday groceries for your home — one-time or a monthly plan.</div>
            </button>
            <button style={card(false)} onClick={() => { setGroceryType('seniors'); setStep('plan'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Seniors Grocery Pickup</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Dedicated, caring grocery service for seniors — one-time or monthly plan.</div>
            </button>
          </div>
        )}

        {/* STEP 2: plan */}
        {step === 'plan' && (
          <div style={{ display: 'grid', gap: 14 }}>
            {groceryType === 'seniors' && <SeniorsInfo />}
            <button style={card(false)} onClick={() => { setKind('grocery'); setPlan('one-time'); setIsMember(false); setStep('form'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>One-Time Grocery Pickup</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Send us your list once — we shop &amp; deliver.</div>
            </button>
            <button style={card(false)} onClick={() => { setPlan('monthly'); setStep('member'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Monthly Pickup Plan</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Regular scheduled pickups &amp; delivery on a plan.</div>
            </button>
            {groceryType === 'seniors' && <SeniorsPlans />}
            <button className="btn-outline" style={{ justifyContent: 'center' }} onClick={() => setStep('type')}>Back</button>
          </div>
        )}

        {/* STEP 3: member check (monthly only) */}
        {step === 'member' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <button style={card(false)} onClick={() => { setKind('grocery'); setIsMember(true); setStep('form'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Already a Member?</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Place your order — fill in your details.</div>
            </button>
            <button style={card(false)} onClick={() => { setKind('membership'); setIsMember(false); setStep('signup'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Not a Member? Sign Up</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Join a monthly pickup &amp; delivery plan.</div>
            </button>
            <button className="btn-outline" style={{ justifyContent: 'center' }} onClick={() => setStep('plan')}>Back</button>
          </div>
        )}

        {/* STEP 4a: common order form (one-time OR existing member) */}
        {step === 'form' && (
          <div className="adm-table-wrap" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Order Details</div>
            <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 18 }}>{typeLabel} &middot; {plan === 'monthly' ? 'Monthly plan (member)' : 'One-time pickup'}</div>
            <Fields form={form} upd={upd} plan={plan} />
            <div className="form-group">
              <label className="form-label">Your grocery / shopping list *</label>
              <textarea className="form-input" rows={5} value={form.items} onChange={e => upd('items', e.target.value)} placeholder="e.g. 2L milk, 1 dozen eggs, bread, bananas, chicken, rice..." style={{ resize: 'vertical' }} />
            </div>
            <GiftField form={form} upd={upd} />
            <div className="form-group"><label className="form-label">Notes for us</label><input className="form-input" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Preferred store, brand notes, delivery instructions..." /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(plan === 'monthly' ? 'member' : 'plan')}>Back</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'} <ArrowIcon /></button>
            </div>
          </div>
        )}

        {/* STEP 4b: membership signup */}
        {step === 'signup' && (
          <div className="adm-table-wrap" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Monthly Plan Sign Up</div>
            <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 18 }}>{typeLabel} &middot; Monthly pickup &amp; delivery plan</div>
            <Fields form={form} upd={upd} plan="monthly" />
            <div className="form-group"><label className="form-label">Anything we should know?</label><input className="form-input" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Preferred pickup day, household size, etc." /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep('member')}>Back</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Sign Up'} <ArrowIcon /></button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin: '0 auto 20px' }}><circle cx="36" cy="36" r="36" fill="#DCFCE7" /><path d="M22 36l10 10 18-18" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 24, fontWeight: 800 }}>Request Received!</div>
            <p style={{ color: 'var(--gray)', margin: '10px 0 6px' }}>Our team will contact you shortly to confirm.</p>
            <div style={{ display: 'inline-block', background: 'var(--cream)', padding: '8px 18px', borderRadius: 8, fontWeight: 700, letterSpacing: 1, margin: '8px 0 24px' }}>{reqId}</div>
            <div><button className="btn-primary" onClick={reset}>New Request</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Fields({ form, upd, plan }) {
  return (
    <>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => upd('name', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Delivery Address {plan !== 'signup' ? '*' : ''}</label><input className="form-input" value={form.address} onChange={e => upd('address', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Unit No. &amp; Buzzer Code (if any)</label><input className="form-input" value={form.unitBuzzer} onChange={e => upd('unitBuzzer', e.target.value)} placeholder="e.g. Unit 204, Buzzer 204" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => upd('city', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" value={form.postalCode} onChange={e => upd('postalCode', e.target.value)} /></div>
      </div>

      <div className="form-row">
        <div className="form-group"><label className="form-label">Order Number (if already placed)</label><input className="form-input" value={form.orderNumber} onChange={e => upd('orderNumber', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Grocery Store Name &amp; Address</label><input className="form-input" value={form.storeName} onChange={e => upd('storeName', e.target.value)} placeholder="Store name" /></div>
      </div>
      <div className="form-group"><label className="form-label">Store Address</label><input className="form-input" value={form.storeAddress} onChange={e => upd('storeAddress', e.target.value)} /></div>

      {plan === 'monthly' ? (
        <div className="form-group"><label className="form-label">Pickup frequency</label>
          <select className="form-input" value={form.frequency} onChange={e => upd('frequency', e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      ) : (
        <div className="form-group"><label className="form-label">Delivery Timing</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => upd('deliveryTiming', 'asap')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${form.deliveryTiming === 'asap' ? 'var(--gold)' : 'var(--gray-lt)'}`, background: form.deliveryTiming === 'asap' ? 'var(--cream)' : 'white', fontWeight: 700, cursor: 'pointer' }}>ASAP</button>
            <button type="button" onClick={() => upd('deliveryTiming', 'scheduled')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${form.deliveryTiming === 'scheduled' ? 'var(--gold)' : 'var(--gray-lt)'}`, background: form.deliveryTiming === 'scheduled' ? 'var(--cream)' : 'white', fontWeight: 700, cursor: 'pointer' }}>Schedule Delivery</button>
          </div>
        </div>
      )}
      {plan !== 'monthly' && form.deliveryTiming === 'scheduled' && (
        <div className="form-row">
          <div className="form-group"><label className="form-label">Preferred Date</label><input className="form-input" type="date" value={form.preferredDate} onChange={e => upd('preferredDate', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Preferred Time</label><input className="form-input" type="time" value={form.preferredTime} onChange={e => upd('preferredTime', e.target.value)} /></div>
        </div>
      )}
    </>
  );
}

function SeniorsInfo() {
  const step = (n, title, body) => (
    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div><div style={{ fontSize: 13, color: 'var(--gray)' }}>{body}</div></div>
    </div>
  );
  return (
    <div className="adm-table-wrap" style={{ padding: 20, marginBottom: 4 }}>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>How OSIPP Works for Seniors</div>
      {step(1, 'Choose Your Monthly Plan', 'Select the seniors delivery plan that best matches your grocery, pharmacy, water, and essential delivery needs.')}
      {step(2, 'Place Your Store Order', 'Order online and choose a pickup time. Need help? Seniors on Assisted Ordering can send us their shopping list and we’ll place the order.')}
      {step(3, 'Send Us the Pickup Details', 'Share the store name, pickup location, order number, and scheduled pickup time with OSIPP.')}
      {step(4, 'We Pick Up Your Order', 'Our delivery team collects your prepared grocery, pharmacy, or essential order from the store.')}
      {step(5, 'We Deliver to Your Door', 'Delivered safely and conveniently to your home or retirement residence.')}
      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-lt)' }}>
        Grocery and store purchases are paid separately and are not included in the monthly plan price. Alcohol and tobacco products are not included in seniors plans and require a separate order with valid ID. All prices are in-store. Text or call us for a special delivery request.
      </div>
    </div>
  );
}

function SeniorsPlans() {
  const plans = [
    { name: 'Resident Essentials', price: '$99/month', items: ['3 deliveries per month', 'Up to 4 grocery/essential bags per delivery', 'Up to 2 cases of water per month', '1 pharmacy pickup per month'] },
    { name: 'Resident Premium', price: '$139/month', items: ['4 deliveries per month', 'Up to 6 grocery/essential bags per delivery', 'Up to 2 cases of water per month', '2 pharmacy pickups per month', 'Priority scheduling', 'Special delivery requests available'] },
    { name: 'Retirement Concierge', price: '$249/month', items: ['5 deliveries per month', 'Up to 6 bags per delivery', 'Up to 4 cases of water per month', 'Assisted grocery ordering included', '2 pharmacy pickups per month', 'Postal & package pickup or drop-off', 'Priority scheduling'] },
    { name: 'Assisted Ordering Add-On', price: '$49/month', items: ['Adds onto Essentials or Premium', 'Send us your shopping list, we place & deliver the order'] }
  ];
  return (
    <div className="adm-table-wrap" style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>Seniors Monthly Plans</div>
      <div style={{ display: 'grid', gap: 14 }}>
        {plans.map(p => (
          <div key={p.name} style={{ border: '1.5px solid var(--gray-lt)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>{p.name}</span><span style={{ color: 'var(--gold-dk, #b8860b)' }}>{p.price}</span></div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--gray)' }}>
              {p.items.map(i => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 14 }}>Alcohol and tobacco products are not included in the monthly plans and must be ordered separately with valid ID. Call or message OSIPP and our team will help you choose a suitable plan.</div>
    </div>
  );
}

// Light-print gift field (as requested by the client)
function GiftField({ form, upd }) {
  return (
    <div className="form-group">
      <label className="form-label" style={{ color: 'var(--gray)', fontWeight: 500 }}>Add a gift? (optional)</label>
      <input className="form-input" value={form.giftDetails} onChange={e => upd('giftDetails', e.target.value)}
        placeholder="Flowers, a card, a Christmas tree, or anything for a special occasion..."
        style={{ color: 'var(--gray)' }} />
    </div>
  );
}
