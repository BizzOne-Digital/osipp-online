import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation, useNavigationType, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import { SearchIcon, CloseIcon } from '../../components/Icons';

const API = process.env.REACT_APP_API_URL || '/api';

// Simplified top-level shopping groups the customer actually thinks in (Whisky, Vodka,
// Tequila...) instead of the raw admin `category` field (Spirits/Wine/Beer/...). Each maps
// to a real `category` plus the specific `subCategory` values that belong under it — the
// second-row chips (e.g. Canadian/Irish/Scotch Whisky) are exactly this list, no extra
// API round-trip needed to know what's available.
const TOP_GROUPS = [
  { key: 'All', label: 'All' },
  { key: 'Beer', label: 'Beer', category: 'Beer', subCategories: ['Beer', 'Craft Beer'], learnSlug: 'beer' },
  { key: 'Whisky', label: 'Whisky', category: 'Spirits', subCategories: ['Canadian Whisky', 'Irish Whisky', 'Scotch Whisky', 'Japanese & International Whisky'], subLearnSlugs: { 'Canadian Whisky': 'canadian-whisky', 'Scotch Whisky': 'scotch-whisky' } },
  { key: 'Vodka', label: 'Vodka', category: 'Spirits', subCategories: ['Vodka', 'Flavoured Vodka'], learnSlug: 'vodka' },
  { key: 'Tequila', label: 'Tequila', category: 'Spirits', subCategories: ['Tequila Blanco', 'Tequila Reposado', 'Tequila Anejo'], learnSlug: 'tequila' },
  { key: 'Rum', label: 'Rum', category: 'Spirits', subCategories: ['Dark Rum', 'White Rum'] },
  { key: 'Gin', label: 'Gin', category: 'Spirits', subCategories: ['Gin', 'Flavoured Gin'] },
  { key: 'Brandy', label: 'Brandy', category: 'Spirits', subCategories: ['Brandy', 'Cognac'] },
  { key: 'Wine', label: 'Wine', category: 'Wine', subCategories: ['Red Wine - Argentina', 'Red Wine - Australia', 'Red Wine - Chile', 'Red Wine - France', 'Red Wine - Italy', 'Red Wine - New Zealand', 'Red Wine - Portugal', 'Red Wine - Spain', 'White Wine - Argentina', 'White Wine - Australia', 'White Wine - Chile', 'White Wine - France', 'White Wine - Italy', 'White Wine - New Zealand', 'White Wine - Portugal', 'Rose', 'VQA Red', 'VQA White', 'Ontario Red', 'Ontario White', 'Fortified', 'Vintage'] },
  { key: 'Coolers', label: 'Coolers', category: 'Ready To Drink', subCategories: ['Coolers', 'Cider', 'Seltzers', 'Cocktails', 'Premixed Cocktails', 'Caesars', 'Teas'], subLearnSlugs: { 'Cocktails': 'cocktails', 'Premixed Cocktails': 'cocktails' } },
  { key: 'Champagne', label: 'Champagne', category: 'Wine', subCategories: ['Champagne', 'Sparkling'] },
  { key: 'Liqueurs', label: 'Liqueurs', category: 'Spirits', subCategories: ['Liqueurs'] },
  { key: 'SojuSake', label: 'Soju & Sake', category: 'Spirits', subCategories: ['Soju & Sake'] },
  { key: 'NonAlcoholic', label: 'Non-Alcoholic', category: 'Beer', subCategories: ['Non-Alcoholic'] },
  { key: 'Convenience', label: 'Convenience', category: 'Convenience', subCategories: ['Cigarettes', 'Drinks & Snacks'] }
];
const groupOf = (key) => TOP_GROUPS.find(g => g.key === key) || TOP_GROUPS[0];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navType = useNavigationType();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(params.get('cat') || 'All');
  const [search, setSearch] = useState(params.get('search') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedSub, setSelectedSub] = useState(params.get('sub') || '');
  const [onSaleOnly, setOnSaleOnly] = useState(params.get('sale') === 'true');
  const restoredRef = useRef(false);
  // Captured once at mount — react-router's navType/location.key change to 'REPLACE' and a
  // new key as soon as the URL-sync effect below calls setParams(), which was re-triggering
  // the fetch effect a second time mid-flight (a real race condition: two concurrent fetches
  // for the same page, and whichever response lands last wins — on a slow/mobile connection
  // this regularly showed "0 products" until the page was manually reloaded).
  const mountNavType = useRef(navType).current;
  const historyKey = useRef(location.key).current;

  const group = groupOf(filter);

  // Reflect the current filter/subcategory/search into the URL (without pushing a new
  // history entry) so that when the customer opens a product and presses Back, this same
  // history entry still carries "Whisky / Scotch Whisky" instead of resetting to All Products.
  useEffect(() => {
    const next = new URLSearchParams();
    if (filter !== 'All') next.set('cat', filter);
    if (selectedSub) next.set('sub', selectedSub);
    if (search) next.set('search', search);
    if (onSaleOnly) next.set('sale', 'true');
    setParams(next, { replace: true });
  }, [filter, selectedSub, search, onSaleOnly, setParams]);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const q = new URLSearchParams();
      if (group.category) q.set('category', group.category);
      if (search) q.set('search', search);
      if (selectedSub) q.set('subCategory', selectedSub);
      else if (group.subCategories) q.set('subCategories', group.subCategories.join(','));
      if (onSaleOnly) q.set('onSale', 'true');
      q.set('sort', 'sortOrder');
      q.set('page', pageNum);
      q.set('limit', 24);

      const res = await axios.get(`${API}/products?${q.toString()}`);
      const items = res.data?.data || [];
      const totalCount = res.data?.total || 0;
      const more = res.data?.hasMore || false;

      if (append) setProducts(prev => [...prev, ...items]);
      else setProducts(items);

      setTotal(totalCount);
      setHasMore(more);
      setPage(pageNum);
      return items.length;
    } catch (err) {
      console.error('Products fetch error:', err.message);
      if (!append) setProducts([]);
      return 0;
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [group, search, selectedSub, onSaleOnly]);

  // On a fresh filter change (not a back/forward restore), reset to page 1 as usual.
  // On a POP navigation (Back button), re-fetch as many pages as were loaded before
  // (tracked in sessionStorage) so "Load More" state is rebuilt, then restore scroll.
  useEffect(() => {
    if (mountNavType === 'POP' && !restoredRef.current) {
      restoredRef.current = true;
      const key = `products-pages:${historyKey}`;
      const savedPages = parseInt(sessionStorage.getItem(key), 10) || 1;
      (async () => {
        setLoading(true);
        for (let p = 1; p <= savedPages; p++) {
          // eslint-disable-next-line no-await-in-loop
          const count = await fetchProducts(p, p > 1);
          if (count === 0) break;
        }
        setLoading(false);
      })();
    } else {
      setPage(1);
      fetchProducts(1, false);
    }
    // Only re-run when the actual filters change — navType/location.key are intentionally
    // excluded (see mountNavType/historyKey above) to avoid the double-fetch race.
  }, [filter, search, selectedSub, onSaleOnly]);

  // Track how many pages have been loaded (for "Load More") and the scroll position,
  // keyed to this specific history entry so Back restores exactly where the customer left off.
  useEffect(() => {
    sessionStorage.setItem(`products-pages:${historyKey}`, String(page));
  }, [page, historyKey]);

  useEffect(() => {
    const onScroll = () => sessionStorage.setItem(`products-scroll:${historyKey}`, String(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [historyKey]);

  useEffect(() => {
    if (mountNavType === 'POP' && !loading) {
      const saved = sessionStorage.getItem(`products-scroll:${historyKey}`);
      if (saved) {
        const y = parseInt(saved, 10);
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
      }
    }
  }, [loading, mountNavType, historyKey]);

  const loadMore = () => fetchProducts(page + 1, true);

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div className="section-title">All Products</div>
          <div className="section-sub">{loading ? 'Loading products...' : `${total} products available`}</div>
        </div>

        <div className="search-wrap" style={{ marginBottom: 20, boxShadow: 'none', border: '1.5px solid var(--gray-lt)', borderRadius: 'var(--r-md)' }}>
          <SearchIcon />
          <input className="search-input" placeholder="Search by name, type..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn-close" onClick={() => setSearch('')} style={{ border: 'none' }}><CloseIcon /></button>}
        </div>

        <div className="prod-filters" style={{ marginBottom: 16 }}>
          <button className={`filter-btn${filter === 'All' ? ' active' : ''}`} onClick={() => { setFilter('All'); setSelectedSub(''); }}>All</button>
          <button className={`filter-btn${onSaleOnly ? ' active' : ''}`} style={onSaleOnly ? { background: 'var(--red)', color: 'white', borderColor: 'var(--red)' } : { color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => setOnSaleOnly(v => !v)}>🔥 Sale</button>
          {TOP_GROUPS.filter(g => g.key !== 'All').map(g => <button key={g.key} className={`filter-btn${filter === g.key ? ' active' : ''}`} onClick={() => { setFilter(g.key); setSelectedSub(''); }}>{g.label}</button>)}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--black)', color: 'white', padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>🎁 OSIPPFREE — <span style={{ color: 'var(--gold)' }}>FREE</span> Delivery + <span style={{ color: 'var(--gold)' }}>FREE</span> Cooler Can</span>
        </div>

        {group.subCategories && (
          <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-lt)', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{group.label} Types</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedSub('')} className={`filter-btn${!selectedSub ? ' active' : ''}`} style={{ padding: '4px 12px', fontSize: 11 }}>All</button>
              {group.subCategories.map(s => <button key={s} onClick={() => setSelectedSub(s)} className={`filter-btn${selectedSub === s ? ' active' : ''}`} style={{ padding: '4px 12px', fontSize: 11 }}>{s}</button>)}
            </div>
            {(group.learnSlug || group.subLearnSlugs?.[selectedSub]) && (
              <Link to={`/learn/${group.learnSlug || group.subLearnSlugs[selectedSub]}`} style={{ display: 'inline-block', marginTop: 12, fontSize: 12, fontWeight: 700, color: 'var(--gold-dk, #b8860b)', textDecoration: 'none' }}>
                📖 Learn more about {selectedSub || group.label} →
              </Link>
            )}
          </div>
        )}

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
        : products.length === 0 ? <div className="empty-state"><div className="empty-state-title">No products found</div></div>
        : <>
          <div className="prod-grid">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
          {hasMore && <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={loadMore} disabled={loadingMore} className="btn-primary" style={{ padding: '14px 40px' }}>
              {loadingMore ? 'Loading...' : `Load More (${products.length} of ${total})`}
            </button>
          </div>}
        </>}
      </div>
    </div>
  );
}
