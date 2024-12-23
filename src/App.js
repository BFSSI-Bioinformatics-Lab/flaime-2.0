// App.js
import { useEffect } from 'react';
import { useNavigate, BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/page/Header";
import Footer from "./components/page/Footer";
import { ThemeProvider } from '@mui/material/styles';
import Theme from "./components/theme/Theme";
import ProductBrowser from "./pages/tools/Product_browser";
import ProductDetail from "./pages/tools/Product_detail";
import Download from "./pages/data/Download";
import Quality from "./pages/data/Quality";
import Visualizations from "./pages/data/Visualizations";
import About from "./pages/About";
import ProductFinder from "./pages/tools/Product_finder";
import AdvancedSearch from "./pages/tools/Advanced_search";
import SignIn from "./pages/SignIn";
import { AuthProvider } from './context/auth/AuthContext';
import PrivateRoute from './context/auth/PrivateRoute';


function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = process.env.REACT_APP_TITLE || 'Default App Title';

    const handleAuthError = () => {
      navigate('/signin');
    };

    const handleLogout = () => {
      navigate('/signin');
    };

    window.addEventListener('authError', handleAuthError);
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('authError', handleAuthError);
      window.removeEventListener('logout', handleLogout);
    };
  }, [navigate]);

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="tools/product-browser" element={<PrivateRoute><ProductBrowser /></PrivateRoute>} />
        <Route path="tools/product-finder" element={<PrivateRoute><ProductFinder /></PrivateRoute>} />
        <Route path="tools/advanced-search" element={<PrivateRoute><AdvancedSearch /></PrivateRoute>} />
        <Route path="data/quality" element={<PrivateRoute><Quality /></PrivateRoute>} />
        <Route path="data/download" element={<PrivateRoute><Download /></PrivateRoute>} />
        <Route path="data/visualizations" element={<PrivateRoute><Visualizations /></PrivateRoute>} />
        <Route path="about" element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="tools/product-browser/:productId" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
      </Routes>
      <Footer />
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={Theme}>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;