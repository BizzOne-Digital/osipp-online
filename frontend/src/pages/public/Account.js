import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Account() {
  const { user, isAuth, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState({ name:'', phone:'', address:'', city:'', postalCode:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuth) {
      axios.get('/api/auth/orders').then(r => setOrders(r.data.data || [])).catch(()=>{});
      setProfile({ name: user?.name||'', phone: user?.phone||'', address: user?.address||'', city: user?.city||'', postalCode: user?.postalCode||'' });
    }
  }, [isAuth, user]);

  if (authLoading) return <div style={{textAlign:'center',padding:80}}><div className="spinner"/></div>;
  if (!isAuth) return <Navigate to="/login" />;

  const saveProfile = async () => {
    setSaving(true);
    try { await axios.put('/api/auth/profile', profile); alert('Profile updated!'); } catch { alert('Failed'); }
    setSaving(false);
  };

  return (
    <div className="section">
      <div className="container" style={{maxWidth:800}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <div>
            <div className="section-title">My Account</div>
            <div className="section-sub">Welcome, {user?.name}</div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Link to="/wishlist" className="btn-outline" style={{fontSize:13,padding:'8px 16px'}}>Wishlist</Link>
            <button onClick={logout} style={{padding:'8px 16px',background:'none',border:'1.5px solid var(--red)',color:'var(--red)',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:600}}>Logout</button>
          </div>
        </div>
        <div className="prod-filters" style={{marginBottom:24}}>
          {['orders','profile'].map(t=><button key={t} className={`filter-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t==='orders'?'My Orders':'Edit Profile'}</button>)}
        </div>
        {tab === 'orders' && (
          orders.length === 0 ? <div style={{textAlign:'center',padding:60,color:'var(--gray)'}}><div style={{fontWeight:600,marginBottom:6}}>No orders yet</div><Link to="/products" className="btn-primary" style={{marginTop:16}}>Start Shopping</Link></div>
          : <div style={{background:'white',borderRadius:'var(--r-md)',border:'1.5px solid var(--gray-lt)',overflow:'hidden'}}>
            {orders.map(o=>(
              <div key={o._id} style={{padding:'16px 20px',borderBottom:'1px solid var(--gray-lt)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{o.orderId}</div>
                  <div style={{fontSize:12,color:'var(--gray)',marginTop:2}}>{o.items.length} items &middot; {new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontWeight:700}}>${o.total.toFixed(2)}</span>
                  <span className={`status-badge ${o.status}`}>{o.status.replace(/_/g,' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'profile' && (
          <div style={{background:'white',borderRadius:'var(--r-md)',border:'1.5px solid var(--gray-lt)',padding:28,maxWidth:500}}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={profile.address} onChange={e=>setProfile(p=>({...p,address:e.target.value}))}/></div>
            <div className="form-row"><div className="form-group"><label className="form-label">City</label><input className="form-input" value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))}/></div><div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" value={profile.postalCode} onChange={e=>setProfile(p=>({...p,postalCode:e.target.value}))}/></div></div>
            <button className="btn-primary" onClick={saveProfile} disabled={saving}>{saving?'Saving...':'Save Profile'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
