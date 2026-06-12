import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = process.env.REACT_APP_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('osipp_token') || '');
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then(r => { setUser(r.data.user); setWishlist(r.data.user.wishlist?.map(w => w._id || w) || []); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('osipp_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, phone, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, phone, password });
    localStorage.setItem('osipp_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('osipp_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(''); setUser(null); setWishlist([]);
  };

  const toggleWishlist = useCallback(async (productId) => {
    if (!user) return false;
    try {
      const res = await axios.post(`${API}/auth/wishlist/${productId}`);
      const ids = res.data.wishlist.map(w => w._id || w);
      setWishlist(ids);
      return ids.includes(productId);
    } catch { return false; }
  }, [user]);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuth: !!user, isAdmin: user?.role === 'admin', toggleWishlist, isInWishlist, wishlist }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);