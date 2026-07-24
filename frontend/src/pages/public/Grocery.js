import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';
const GROCERY_PICKUP_FEE = 19.99;

const SENIORS_PLANS = [
  { code: 'essentials', name: 'Resident Essentials', price: 99, items: ['3 deliveries per month', 'Up to 4 grocery/essential bags per delivery', 'Up to 2 cases of water per month', '1 pharmacy pickup per month'] },
  { code: 'premium', name: 'Resident Premium', price: 139, items: ['4 deliveries per month', 'Up to 6 grocery/essential bags per delivery', 'Up to 2 cases of water per month', '2 pharmacy pickups per month', 'Priority scheduling', 'Special delivery requests available'] },
  { code: 'concierge', name: 'Retirement Concierge', price: 249, items: ['5 deliveries per month', 'Up to 6 bags per delivery', 'Up to 4 cases of water per month', 'Assisted grocery ordering included', '2 pharmacy pickups per month', 'Postal & package pickup or drop-off', 'Priority scheduling'] },
  { code: 'assisted-addon', name: 'Assisted Ordering Add-On', price: 49, items: ['Adds onto Essentials or Premium', 'Send us your shopping list, we place & deliver the order'] }
];

const card = (active) => ({
  border: `2px solid ${active ? 'var(--gold)' : 'var(--gray-lt)'}`,
  background: active ? 'var(--cream)' : 'white',
  borderRadius: 14, padding: '22px 20px', cursor: 'pointer', textAlign: 'left',
  transition: 'all .15s', width: '100%'
});

export default function Grocery() {
  const { user } = useAuth();
  // step: type -> plan(seniors only) -> billing(seniors monthly) -> form(one-time) -> success
  const [step, setStep] = useState('type');
  const [groceryType, setGroceryType] = useState('');   // household | seniors
  const [plan, setPlan] = useState('');                 // one-time | monthly
  const [planCode, setPlanCode] = useState('');
  const [billingType, setBillingType] = useState('auto-renew'); // auto-renew | manual
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    address: user?.address || '', city: user?.city || 'Mississauga', postalCode: user?.postalCode || '',
    unitBuzzer: '', orderNumber: '', storeName: '', storeAddress: '',
    items: '', preferredDate: '', preferredTime: '', deliveryTiming: 'asap', frequency: 'weekly', giftDetails: '', notes: ''
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // One-time grocery pickup & delivery — $19.99, paid online via Stripe before we act on the request.
  const submit = async () => {
    if (!form.name || !form.phone) return alert('Please enter your name and phone');
    if (!form.address) return alert('Please enter your delivery/pickup address');
    if (!form.items) return alert('Please enter your grocery/shopping list');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/services/checkout`, {
        serviceType: 'grocery-one-time', groceryType,
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, unitBuzzer: form.unitBuzzer, city: form.city, postalCode: form.postalCode },
        orderNumber: form.orderNumber, storeName: form.storeName, storeAddress: form.storeAddress,
        items: form.items, giftDetails: form.giftDetails,
        deliveryTiming: form.deliveryTiming, preferredDate: form.preferredDate, preferredTime: form.preferredTime,
        notes: form.notes
      });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) { alert(err.response?.data?.message || 'Could not start checkout'); setLoading(false); }
  };

  const payForPlan = async () => {
    if (!form.name || !form.phone) return alert('Please enter your name and phone');
    if (!form.address) return alert('Please enter your delivery address');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/services/plan-checkout`, {
        planCode, billingType, groceryType: 'seniors', frequency: form.frequency,
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, unitBuzzer: form.unitBuzzer, city: form.city, postalCode: form.postalCode },
        notes: form.notes
      });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) { alert(err.response?.data?.message || 'Could not start checkout'); setLoading(false); }
  };

  const typeLabel = groceryType === 'seniors' ? 'Seniors' : 'Grocery';
  const selectedPlan = SENIORS_PLANS.find(p => p.code === planCode);

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
            {selectedPlan && <span style={{ background: 'var(--cream)', padding: '4px 12px', borderRadius: 99, fontWeight: 600 }}>{selectedPlan.name}</span>}
          </div>
        )}

        {/* STEP 1: type */}
        {step === 'type' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <button style={card(false)} onClick={() => { setGroceryType('household'); setPlan('one-time'); setStep('form'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>One-Time Grocery Pickup &amp; Delivery</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Send us your list once — we shop &amp; deliver to your door.</div>
            </button>
            <button style={card(false)} onClick={() => { setGroceryType('seniors'); setStep('plan'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>Seniors Grocery Pickup</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Dedicated, caring grocery service for seniors — one-time or monthly plan.</div>
            </button>
          </div>
        )}

        {/* STEP 2: Seniors — info, monthly plans (payable), or one-time pickup */}
        {step === 'plan' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <SeniorsInfo />
            <button style={card(false)} onClick={() => { setPlan('one-time'); setStep('form'); }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800 }}>One-Time Grocery Pickup</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Send us your list once — we shop &amp; deliver.</div>
            </button>

            <div className="adm-table-wrap" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Seniors Monthly Plans</div>
              <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 14 }}>Choose a plan below to pay online and get started.</div>
              <div style={{ display: 'grid', gap: 14 }}>
                {SENIORS_PLANS.map(p => (
                  <button key={p.code} style={card(false)} onClick={() => { setPlan('monthly'); setPlanCode(p.code); setStep('billing'); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>{p.name}</span><span style={{ color: 'var(--gold-dk, #b8860b)' }}>${p.price}/month</span></div>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--gray)' }}>
                      {p.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 14, lineHeight: 1.6 }}>
                Alcohol and tobacco products are not included in the monthly plans and must be ordered separately with valid ID. Unused deliveries do not carry over to the following month — all included deliveries must be used within the current billing month. Product purchases, gift items, and any applicable store charges are priced separately and are not included in the monthly plan fee.
                <br /><br />
                <b>OSIPP and its delivery drivers are not responsible for faulty, damaged, incorrect, or missing items supplied or packed by the store.</b> Customers must contact the store or retailer directly regarding product-related concerns. See our full <Link to="/grocery-terms" style={{ color: 'var(--gold-dk, #b8860b)', fontWeight: 700 }}>Delivery Terms &amp; Policy</Link> for details.
              </div>
            </div>

            <button className="btn-outline" style={{ justifyContent: 'center' }} onClick={() => setStep('type')}>Back</button>
          </div>
        )}

        {/* STEP 3: billing choice + customer info + pay (Seniors monthly plan) */}
        {step === 'billing' && selectedPlan && (
          <div className="adm-table-wrap" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selectedPlan.name} — ${selectedPlan.price}/month</div>
            <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 18 }}>Choose how you'd like to be billed.</div>

            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              <button style={card(billingType === 'auto-renew')} onClick={() => setBillingType('auto-renew')}>
                <div style={{ fontWeight: 800 }}>Auto-Renew Monthly</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 2 }}>Your card is charged automatically every month — cancel anytime by contacting us.</div>
              </button>
              <button style={card(billingType === 'manual')} onClick={() => setBillingType('manual')}>
                <div style={{ fontWeight: 800 }}>Pay Month-to-Month</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 2 }}>No auto-renewal — you pay each month yourself, whenever you're ready.</div>
              </button>
            </div>

            <Fields form={form} upd={upd} plan="monthly" />
            <div className="form-group"><label className="form-label">Anything we should know?</label><input className="form-input" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Preferred pickup day, household size, etc." /></div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep('plan')}>Back</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={payForPlan} disabled={loading}>
                {loading ? 'Redirecting...' : `Pay $${selectedPlan.price} & Subscribe`} <ArrowIcon />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: one-time grocery pickup form (household or seniors) */}
        {step === 'form' && (
          <div className="adm-table-wrap" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Order Details</div>
            <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 18 }}>{typeLabel} &middot; One-time pickup</div>
            <Fields form={form} upd={upd} plan={plan} />
            <div className="form-group">
              <label className="form-label">Your grocery / shopping list *</label>
              <textarea className="form-input" rows={5} value={form.items} onChange={e => upd('items', e.target.value)} placeholder="e.g. 2L milk, 1 dozen eggs, bread, bananas, chicken, rice..." style={{ resize: 'vertical' }} />
            </div>
            <GiftField form={form} upd={upd} />
            <div className="form-group"><label className="form-label">Notes for us</label><input className="form-input" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Preferred store, brand notes, delivery instructions..." /></div>
            <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
              <span>Pickup &amp; Delivery Fee</span><span>${GROCERY_PICKUP_FEE.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--gray)', marginBottom: 14 }}>Grocery/store purchases are paid separately, directly to the store. This fee covers pickup &amp; delivery only.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(groceryType === 'seniors' ? 'plan' : 'type')}>Back</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={submit} disabled={loading}>{loading ? 'Redirecting...' : `Pay $${GROCERY_PICKUP_FEE.toFixed(2)} & Submit`} <ArrowIcon /></button>
            </div>
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
      <div className="form-group"><label className="form-label">Delivery Address *</label><input className="form-input" value={form.address} onChange={e => upd('address', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Unit No. &amp; Buzzer Code (if any)</label><input className="form-input" value={form.unitBuzzer} onChange={e => upd('unitBuzzer', e.target.value)} placeholder="e.g. Unit 204, Buzzer 204" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => upd('city', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" value={form.postalCode} onChange={e => upd('postalCode', e.target.value)} /></div>
      </div>

      {plan !== 'monthly' && (
        <>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Order Number (if already placed)</label><input className="form-input" value={form.orderNumber} onChange={e => upd('orderNumber', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Grocery Store Name &amp; Address</label><input className="form-input" value={form.storeName} onChange={e => upd('storeName', e.target.value)} placeholder="Store name" /></div>
          </div>
          <div className="form-group"><label className="form-label">Store Address</label><input className="form-input" value={form.storeAddress} onChange={e => upd('storeAddress', e.target.value)} /></div>
        </>
      )}

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
