import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerRegister() {
  const { register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuth) return <Navigate to="/account" />;
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try { await register(form.name, form.email, form.phone, form.password); navigate('/account'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div className="section" style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <img src="/images/logo.png" alt="O'SIPP" style={{height:64,margin:'0 auto 12px',display:'block'}}/>
          <h2 style={{fontFamily:'var(--font-d)',fontSize:26,fontWeight:800}}>Create Account</h2>
          <p style={{color:'var(--gray)',fontSize:14}}>Sign up for faster checkout & order tracking</p>
        </div>
        <form onSubmit={handleSubmit} style={{background:'white',border:'1.5px solid var(--gray-lt)',borderRadius:'var(--r-lg)',padding:32}}>
          {error && <div style={{color:'var(--red)',fontSize:13,textAlign:'center',marginBottom:12}}>{error}</div>}
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e=>upd('name',e.target.value)} required/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>upd('email',e.target.value)} required/></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>upd('phone',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e=>upd('password',e.target.value)} required/></div>
          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={form.confirm} onChange={e=>upd('confirm',e.target.value)} required/></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15}}>{loading?'Creating...':'Create Account'}</button>
          <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'var(--gray)'}}>Already have an account? <Link to="/login" style={{color:'var(--gold)',fontWeight:600}}>Sign In</Link></div>
          <div style={{textAlign:'center',marginTop:8,fontSize:11,color:'var(--gray)'}}>19+ Only. Must be of legal drinking age.</div>
        </form>
      </div>
    </div>
  );
}
