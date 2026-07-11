import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import { PlusIcon, MinusIcon, CheckIcon, ArrowIcon, BottleSVG, TruckIcon, ShieldIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { isAuth, toggleWishlist, isInWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); setNotFound(false); setVariantIdx(0); setQty(1); setImgError(false);
    axios.get(`${API}/products/${id}`)
      .then(r => {
        const p = r.data.data;
        setProduct(p);
        axios.get(`${API}/products?category=${encodeURIComponent(p.category)}&limit=5`)
          .then(rr => setRelated((rr.data.data || []).filter(x => x._id !== p._id).slice(0, 4)))
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><div className="spinner" /></div>;
  if (notFound || !product) return (
    <div className="section"><div className="container" style={{ textAlign: 'center', padding: 60 }}>
      <div className="section-title">Product not found</div>
      <Link to="/products" className="btn-primary" style={{ marginTop: 20 }}>Back to Products <ArrowIcon /></Link>
    </div></div>
  );

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const variant = hasVariants ? product.variants[variantIdx] : null;
  const price = variant ? variant.price : product.price;
  const stock = variant ? variant.stock : product.stock;
  const outOfStock = stock <= 0;
  const inWish = isAuth && isInWishlist(product._id);

  const addToCart = () => {
    for (let n = 0; n < qty; n++) addItem(product, hasVariants ? variantIdx : null);
  };
  const handleAdd = () => {
    addToCart();
    setAdded(true); setTimeout(() => setAdded(false), 1600);
  };
  const handleBuyNow = () => {
    addToCart();
    openCart(); // jump straight to cart/checkout
  };

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--gray)', textDecoration: 'none' }}>Home</Link><span>/</span>
          <Link to={`/products?cat=${product.category}`} style={{ color: 'var(--gray)', textDecoration: 'none' }}>{product.category}</Link><span>/</span>
          <span style={{ color: 'var(--black)', fontWeight: 600 }}>{product.name}</span>
        </div>

        <div className="pd-grid">
          {/* Image */}
          <div className="pd-image">
            {product.badge && <span className={`prod-badge${product.badge === 'Sale' ? ' sale' : ''}`} style={{ top: 16, left: 16 }}>{product.badge}</span>}
            {product.image && !imgError
              ? <img src={product.image} alt={product.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 18 }} />
              : <BottleSVG cat={product.category} />}
          </div>

          {/* Info */}
          <div>
            <div className="prod-category" style={{ marginBottom: 8 }}>{product.category} &middot; {product.store}</div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 10 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
              <div className="prod-price" style={{ fontSize: 30 }}><sup>$</sup>{price.toFixed(2)}</div>
              {!hasVariants && product.volume && <span style={{ color: 'var(--gray)', fontSize: 14 }}>· {product.volume}</span>}
            </div>

            {product.description && (
              <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
            )}

            {/* Size options */}
            {hasVariants && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray)', marginBottom: 10 }}>Choose Size</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {product.variants.map((v, i) => {
                    const active = i === variantIdx;
                    const off = v.stock <= 0;
                    return (
                      <button key={i} disabled={off} onClick={() => { setVariantIdx(i); setQty(1); }}
                        style={{
                          padding: '12px 16px', borderRadius: 10, cursor: off ? 'not-allowed' : 'pointer',
                          border: `2px solid ${active ? 'var(--gold)' : 'var(--gray-lt)'}`,
                          background: active ? 'var(--cream)' : 'white', textAlign: 'left', minWidth: 130,
                          opacity: off ? 0.45 : 1, transition: 'all .15s'
                        }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{v.label}</div>
                        <div style={{ fontSize: 14, color: 'var(--gold-dk)', fontWeight: 700, marginTop: 2 }}>${v.price.toFixed(2)}</div>
                        {off && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>Out of stock</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: 20, fontSize: 13, fontWeight: 600, color: outOfStock ? 'var(--red)' : 'var(--green)' }}>
              {outOfStock ? '● Out of stock' : stock < 10 ? `● Only ${stock} left` : '● In stock'}
            </div>

            {/* Quantity + Actions */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <div className="qty-ctrl" style={{ border: '1.5px solid var(--gray-lt)', borderRadius: 8 }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><MinusIcon /></button>
                <span className="qty-num" style={{ minWidth: 36, textAlign: 'center' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(stock || 99, q + 1))}><PlusIcon /></button>
              </div>
              <button className="btn-outline" style={{ flex: 1, minWidth: 180, justifyContent: 'center', padding: '14px 24px' }} onClick={handleAdd} disabled={outOfStock}>
                {added ? <><CheckIcon /> Added</> : outOfStock ? 'Out of Stock' : <>Add to Cart</>}
              </button>
              {isAuth && (
                <button onClick={() => toggleWishlist(product._id)} title="Wishlist"
                  style={{ width: 48, height: 48, borderRadius: 8, border: '1.5px solid var(--gray-lt)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={inWish ? '#C0392B' : 'none'} stroke={inWish ? '#C0392B' : 'var(--gray)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
              )}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px 24px', marginBottom: 24 }} onClick={handleBuyNow} disabled={outOfStock}>
              {outOfStock ? 'Out of Stock' : <>Buy Now · ${(price * qty).toFixed(2)} <ArrowIcon /></>}
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '18px 0', borderTop: '1px solid var(--gray-lt)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray)', fontWeight: 600 }}><span style={{ color: 'var(--gold)' }}><TruckIcon /></span> ~40 min delivery</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray)', fontWeight: 600 }}><span style={{ color: 'var(--gold)' }}><ShieldIcon /></span> 19+ ID required</div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <div className="section-title" style={{ fontSize: 22, marginBottom: 20 }}>You may also like</div>
            <div className="prod-grid">{related.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
