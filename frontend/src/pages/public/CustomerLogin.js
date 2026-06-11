import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerLogin() {
  const { login, isAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuth) return <Navigate to="/account" />;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/account'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div className="section" style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <img src="/images/logo.png" alt="O'SIPP" style={{height:64,margin:'0 auto 12px',display:'block'}}/>
          <h2 style={{fontFamily:'var(--font-d)',fontSize:26,fontWeight:800}}>Welcome Back</h2>
          <p style={{color:'var(--gray)',fontSize:14}}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} style={{background:'white',border:'1.5px solid var(--gray-lt)',borderRadius:'var(--r-lg)',padding:32}}>
          {error && <div style={{color:'var(--red)',fontSize:13,textAlign:'center',marginBottom:12}}>{error}</div>}
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15}}>{loading?'Signing in...':'Sign In'}</button>
          <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'var(--gray)'}}>Don't have an account? <Link to="/register" style={{color:'var(--gold)',fontWeight:600}}>Sign Up</Link></div>
        </form>
      </div>
    </div>
  );
}
