import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CheckIcon, BottleSVG } from './Icons';

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled?'#C0392B':'none'} stroke={filled?'#C0392B':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuth, toggleWishlist, isInWishlist } = useAuth();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inWish = isAuth && isInWishlist(product._id);
  const handleAdd = () => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  const handleWish = async (e) => { e.stopPropagation(); if (isAuth) await toggleWishlist(product._id); };

  return (
    <div className="prod-card">
      <div className="prod-img-wrap">
        {product.badge && <span className={`prod-badge${product.badge==='Sale'?' sale':''}`}>{product.badge}</span>}
        {isAuth && (
          <button onClick={handleWish} style={{position:'absolute',top:10,right:10,background:'white',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,.12)',zIndex:2}}>
            <HeartIcon filled={inWish}/>
          </button>
        )}
        {product.image && !imgError ? <img src={product.image} alt={product.name} onError={()=>setImgError(true)} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/> : <BottleSVG cat={product.category}/>}
      </div>
      <div className="prod-body">
        <div className="prod-category">{product.category} &middot; {product.store}</div>
        <div className="prod-name">{product.name}</div>
        <div className="prod-volume">{product.subCategory} &middot; {product.volume}</div>
        <div className="prod-footer">
          <div className="prod-price"><sup>$</sup>{product.price.toFixed(2)}</div>
          <button className={`btn-add${added?' added':''}`} onClick={handleAdd}>{added?<CheckIcon/>:<PlusIcon/>}</button>
        </div>
      </div>
    </div>
  );
}
