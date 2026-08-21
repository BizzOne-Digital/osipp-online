import { Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import AdminSidebar from './components/AdminSidebar';
import PromoBanner from './components/PromoBanner';
import WelcomePopup from './components/WelcomePopup';

import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Grocery from './pages/public/Grocery';
import Blog from './pages/public/Blog';
import GroceryTerms from './pages/public/GroceryTerms';
import KnowledgeHub from './pages/public/KnowledgeHub';
import Gifts from './pages/public/Gifts';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import Tracking from './pages/public/Tracking';
import OrderSuccess from './pages/public/OrderSuccess';
import CustomerLogin from './pages/public/CustomerLogin';
import CustomerRegister from './pages/public/CustomerRegister';
import Account from './pages/public/Account';
import Wishlist from './pages/public/Wishlist';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCoupons from './pages/admin/Coupons';
import AdminCustomers from './pages/admin/Customers';
import AdminServices from './pages/admin/Services';
import AdminSettings from './pages/admin/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    // Only force scroll-to-top on a fresh forward navigation (PUSH) or REPLACE.
    // On back/forward (POP) the browser/Products page restores the previous scroll
    // position itself — forcing (0,0) here was overriding that on every back press.
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);
  return null;
}

function PrivateRoute({ children }) {
  const { isAuth, isAdmin, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'100vh' }}><div className="spinner"/></div>;
  return (isAuth && isAdmin) ? children : <Navigate to="/admin/login" />;
}

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="adm-layout">
      <button className="adm-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '✕' : '☰'}</button>
      {sidebarOpen && <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="adm-main">{children}</div>
    </div>
  );
}

export default function App() {
  const { toast, cartOpen, openCart, closeCart } = useCart();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Take manual control of scroll restoration so our own logic (Products page, etc.)
  // decides where to land on back/forward instead of the browser guessing mid-render.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  return (
    <>
      <ScrollToTop />
      {!isAdmin && (
        <>
          <PromoBanner />
          <Navbar onCartOpen={openCart} />
          <WelcomePopup />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/grocery-terms" element={<GroceryTerms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/learn/:slug" element={<KnowledgeHub />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
          <Footer />
          {cartOpen && <CartDrawer onClose={closeCart} />}
          {toast && <Toast msg={toast} />}
        </>
      )}
      {isAdmin && (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<PrivateRoute><AdminLayout><AdminDashboard /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute><AdminLayout><AdminOrders /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute><AdminLayout><AdminProducts /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/coupons" element={<PrivateRoute><AdminLayout><AdminCoupons /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/customers" element={<PrivateRoute><AdminLayout><AdminCustomers /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/services" element={<PrivateRoute><AdminLayout><AdminServices /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute><AdminLayout><AdminSettings /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/*" element={<Navigate to="/admin" />} />
        </Routes>
      )}
    </>
  );
}
