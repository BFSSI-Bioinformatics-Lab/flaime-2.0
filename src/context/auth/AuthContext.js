import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/auth/AuthService';

// AuthContext manages the user state and provides authentication methods to your components

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const handleSessionExpired = (event) => {
        setUser(null);
        alert(event.detail.message);
        navigate('/signin');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    const token = localStorage.getItem('accessToken');
    if (token) {
        const payload = authService.parseJwt(token);
        if (payload) {
            setUser(payload);
            authService.scheduleTokenRefresh(token);
        }
    }
    setLoading(false);

    return () => {
        window.removeEventListener('sessionExpired', handleSessionExpired);
    };
}, [navigate]);


  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      const payload = authService.parseJwt(data.access);
      setUser(payload);
      return data;
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    await authService.logout();
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;