import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import AdminSidebar from './components/AdminSidebar';

import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Grocery from './pages/public/Grocery';
import Gifts from './pages/public/Gifts';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import Tracking from './pages/public/Tracking';
import CustomerLogin from './pages/public/CustomerLogin';
import CustomerRegister from './pages/public/CustomerRegister';
import Account from './pages/public/Account';
import Wishlist from './pages/public/Wishlist';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCustomers from './pages/admin/Customers';
import AdminServices from './pages/admin/Services';
import AdminBulkImages from './pages/admin/BulkImages';
import AdminSettings from './pages/admin/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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

  return (
    <>
      <ScrollToTop />
      {!isAdmin && (
        <>
          <Navbar onCartOpen={openCart} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/tracking" element={<Tracking />} />
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
          <Route path="/admin/bulk-images" element={<PrivateRoute><AdminLayout><AdminBulkImages /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/customers" element={<PrivateRoute><AdminLayout><AdminCustomers /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/services" element={<PrivateRoute><AdminLayout><AdminServices /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute><AdminLayout><AdminSettings /></AdminLayout></PrivateRoute>} />
          <Route path="/admin/*" element={<Navigate to="/admin" />} />
        </Routes>
      )}
    </>
  );
}
