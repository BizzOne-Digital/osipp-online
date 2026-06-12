import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default function Wishlist() {
  const { isAuth, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuth) {
      axios.get(`${API}/auth/wishlist`)
        .then(r => setProducts(r.data?.data || []))
        .catch(()=>{})
        .finally(()=>setLoading(false));
    } else { setLoading(false); }
  }, [isAuth]);

  if (authLoading) return <div style={{textAlign:'center',padding:80}}><div className="spinner"/></div>;
  if (!isAuth) return <Navigate to="/login" />;

  return (
    <div className="section">
      <div className="container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28}}>
          <div><div className="section-title">My Wishlist</div><div className="section-sub">{products.length} saved products</div></div>
          <Link to="/products" className="btn-outline">Browse Products</Link>
        </div>
        {loading ? <div style={{textAlign:'center',padding:60}}><div className="spinner"/></div>
        : products.length === 0 ? <div style={{textAlign:'center',padding:60,color:'var(--gray)'}}><div style={{fontWeight:600,marginBottom:6}}>Your wishlist is empty</div><div style={{fontSize:13}}>Click the heart on any product to save it</div></div>
        : <div className="prod-grid">{products.map(p => <ProductCard key={p._id} product={p}/>)}</div>}
      </div>
    </div>
  );
}