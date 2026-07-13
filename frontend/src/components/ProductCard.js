import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowIcon } from './Icons';

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled?'#C0392B':'none'} stroke={filled?'#C0392B':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Soft background tint per category (like the reference design)
const CAT_TINT = {
  'Beer': '#FBEAC9',
  'Spirits': '#EAE3F5',
  'Wine': '#F6DEE6',
  'Convenience': '#E3F0D3',
  'Ready To Drink': '#FBE2CF',
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuth, toggleWishlist, isInWishlist } = useAuth();
  const [imgError, setImgError] = useState(false);
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const inWish = isAuth && isInWishlist(product._id);

  const minPrice = hasVariants ? Math.min(...product.variants.map(v => v.price)) : product.price;
  const outOfStock = hasVariants ? product.variants.every(v => v.stock <= 0) : product.stock <= 0;
  const tint = CAT_TINT[product.category] || 'var(--cream)';

  const openDetail = () => navigate(`/product/${product._id}`);
  const handleWish = async (e) => { e.stopPropagation(); if (isAuth) await toggleWishlist(product._id); };

  return (
    <div className="prod-card" onClick={openDetail} style={{ background: tint }}>
      {product.badge && <span className={`prod-badge${product.badge==='Sale'?' sale':''}`}>{product.badge}</span>}
      {isAuth && (
        <button onClick={handleWish} style={{position:'absolute',top:14,right:14,background:'white',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,.12)',zIndex:3}}>
          <HeartIcon filled={inWish}/>
        </button>
      )}
      <div className="prod-img-wrap">
        {product.image && !imgError
          ? <img src={product.image} alt={product.name} onError={()=>setImgError(true)} loading="lazy"/>
          : <div style={{fontSize:11,color:'var(--gray)',alignSelf:'center',fontWeight:600}}>No image</div>}
      </div>
      <div className="prod-body">
        <div className="prod-category">{product.category}</div>
        <div className="prod-topline">
          <div className="prod-name">{product.name}</div>
          <div className="prod-price">{hasVariants && <span style={{fontSize:10,fontWeight:600,color:'var(--gray)',marginRight:2}}>from</span>}<sup>$</sup>{minPrice.toFixed(2)}</div>
        </div>
        <div className="prod-subline">
          <span>{hasVariants ? `${product.variants.length} sizes` : (product.volume || ' ')}</span>
          <span style={{display:'inline-flex',alignItems:'center',gap:3,fontWeight:700,color:outOfStock?'var(--red)':'var(--gold-dk)'}}>
            {outOfStock ? 'Out of stock' : <>View <ArrowIcon/></>}
          </span>
        </div>
      </div>
    </div>
  );
}
