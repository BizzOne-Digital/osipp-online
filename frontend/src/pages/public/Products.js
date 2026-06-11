import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { SearchIcon, CloseIcon } from '../../components/Icons';

const CATS = ['All', 'Spirits', 'Wine', 'Beer', 'Ready To Drink', 'Convenience'];
const SORTS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function Products() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(params.get('cat') || 'All');
  const [search, setSearch] = useState(params.get('search') || '');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const q = new URLSearchParams();
      if (filter !== 'All') q.set('category', filter);
      if (search) q.set('search', search);
      if (selectedSub) q.set('subCategory', selectedSub);
      q.set('sort', sort);
      q.set('page', pageNum);
      q.set('limit', 24);

      const res = await axios.get(`/api/products?${q.toString()}`);
      const data = res.data;

      if (append) setProducts(prev => [...prev, ...data.data]);
      else setProducts(data.data);

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);

      // Get subcategories for current category
      if (!append && data.data.length > 0) {
        const subs = [...new Set(data.data.map(p => p.subCategory).filter(Boolean))].sort();
        setSubCategories(subs);
      }
    } catch (err) { console.error(err); }
    setLoading(false); setLoadingMore(false);
  }, [filter, search, sort, selectedSub]);

  useEffect(() => { setPage(1); fetchProducts(1, false); }, [filter, search, sort, selectedSub]);

  const loadMore = () => fetchProducts(page + 1, true);

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">All Products</div>
          <div className="section-sub">{total} products available</div>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 20, boxShadow: 'none', border: '1.5px solid var(--gray-lt)', borderRadius: 'var(--r-md)' }}>
          <SearchIcon />
          <input className="search-input" placeholder="Search by name, type..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn-close" onClick={() => setSearch('')} style={{ border: 'none' }}><CloseIcon /></button>}
        </div>

        {/* Categories + Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div className="prod-filters" style={{ marginBottom: 0 }}>
            {CATS.map(c => (
              <button key={c} className={`filter-btn${filter === c ? ' active' : ''}`}
                onClick={() => { setFilter(c); setSelectedSub(''); }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '7px 14px', border: '1.5px solid var(--gray-lt)', borderRadius: 6, background: showFilters ? 'var(--black)' : 'white', color: showFilters ? 'white' : 'var(--gray)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Filters {selectedSub ? ' ●' : ''}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '7px 12px', border: '1.5px solid var(--gray-lt)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'white' }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Sub-category filter panel */}
        {showFilters && subCategories.length > 0 && (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-lt)', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Sub Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedSub('')} className={`filter-btn${!selectedSub ? ' active' : ''}`} style={{ padding: '4px 12px', fontSize: 11 }}>All</button>
              {subCategories.map(s => (
                <button key={s} onClick={() => setSelectedSub(s)} className={`filter-btn${selectedSub === s ? ' active' : ''}`} style={{ padding: '4px 12px', fontSize: 11 }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No products found</div>
            <div className="empty-state-sub">Try different filters or search terms</div>
          </div>
        ) : (
          <>
            <div className="prod-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Load More */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={loadMore} disabled={loadingMore}
                  className="btn-primary" style={{ padding: '14px 40px', fontSize: 15 }}>
                  {loadingMore ? 'Loading...' : `Load More Products (${products.length} of ${total})`}
                </button>
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray)' }}>
                Showing all {products.length} products
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}