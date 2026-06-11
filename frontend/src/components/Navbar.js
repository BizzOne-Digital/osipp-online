import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartIcon, WhatsAppIcon, MenuIcon, CloseIcon } from './Icons';

const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function Navbar({ onCartOpen }) {
  const { itemCount } = useCart();
  const { isAuth, user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const links = [{ to:'/',label:'Home' },{ to:'/products',label:'Products' },{ to:'/about',label:'About' },{ to:'/contact',label:'Contact' },{ to:'/tracking',label:'Track Order' }];

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo"><img src="/images/logo.png" alt="O'SIPP" style={{height:46,width:'auto',objectFit:'contain'}}/></Link>
        <div className="nav-links">{links.map(l=><Link key={l.to} to={l.to} className={`nav-link${pathname===l.to?' active':''}`}>{l.label}</Link>)}</div>
        <div className="nav-actions">
          <button className="btn-icon" onClick={onCartOpen}><CartIcon/>{itemCount>0 && <span className="cart-badge">{itemCount}</span>}</button>
          <button className="btn-wa" onClick={()=>window.open('https://wa.me/19054622160','_blank')}><WhatsAppIcon/><span>WhatsApp</span></button>

          {isAuth ? (
            <div style={{position:'relative'}}>
              <button className="btn-icon" onClick={()=>setUserMenu(!userMenu)} style={{fontSize:11,fontWeight:700}}><UserIcon/></button>
              {userMenu && (
                <div style={{position:'absolute',right:0,top:'110%',background:'white',border:'1.5px solid var(--gray-lt)',borderRadius:10,padding:8,minWidth:180,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,.12)',animation:'fadeUp .15s ease'}}>
                  <div style={{padding:'8px 12px',fontSize:12,color:'var(--gray)',borderBottom:'1px solid var(--gray-lt)',marginBottom:4}}>{user?.name}</div>
                  <Link to="/account" onClick={()=>setUserMenu(false)} style={{display:'block',padding:'8px 12px',fontSize:13,fontWeight:500,borderRadius:6,color:'var(--black)'}} onMouseOver={e=>e.target.style.background='var(--cream)'} onMouseOut={e=>e.target.style.background='transparent'}>My Account</Link>
                  <Link to="/wishlist" onClick={()=>setUserMenu(false)} style={{display:'block',padding:'8px 12px',fontSize:13,fontWeight:500,borderRadius:6,color:'var(--black)'}} onMouseOver={e=>e.target.style.background='var(--cream)'} onMouseOut={e=>e.target.style.background='transparent'}>Wishlist</Link>
                  {isAdmin && <Link to="/admin" onClick={()=>setUserMenu(false)} style={{display:'block',padding:'8px 12px',fontSize:13,fontWeight:500,borderRadius:6,color:'var(--gold-dk)'}} onMouseOver={e=>e.target.style.background='var(--cream)'} onMouseOut={e=>e.target.style.background='transparent'}>Admin Panel</Link>}
                  <button onClick={()=>{logout();setUserMenu(false);}} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',fontSize:13,fontWeight:500,border:'none',background:'none',cursor:'pointer',borderRadius:6,color:'var(--red)'}} onMouseOver={e=>e.target.style.background='#FFF0F0'} onMouseOut={e=>e.target.style.background='transparent'}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-icon" style={{fontSize:11,fontWeight:700}}><UserIcon/></Link>
          )}

          <button className="btn-icon mobile-menu-btn" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<CloseIcon/>:<MenuIcon/>}</button>
        </div>
      </div>
      {mobileOpen && (
        <div style={{position:'absolute',top:68,left:0,right:0,background:'white',borderBottom:'1.5px solid var(--gray-lt)',padding:'12px 24px',zIndex:99,animation:'fadeUp .2s ease'}}>
          {links.map(l=><Link key={l.to} to={l.to} className={`nav-link${pathname===l.to?' active':''}`} style={{display:'block',padding:'12px 0'}} onClick={()=>setMobileOpen(false)}>{l.label}</Link>)}
          {isAuth ? <>
            <Link to="/account" style={{display:'block',padding:'12px 0'}} className="nav-link" onClick={()=>setMobileOpen(false)}>My Account</Link>
            <Link to="/wishlist" style={{display:'block',padding:'12px 0'}} className="nav-link" onClick={()=>setMobileOpen(false)}>Wishlist</Link>
          </> : <Link to="/login" style={{display:'block',padding:'12px 0'}} className="nav-link" onClick={()=>setMobileOpen(false)}>Sign In</Link>}
        </div>
      )}
    </nav>
  );
}
