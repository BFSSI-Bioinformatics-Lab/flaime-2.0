// import Table from "./components/Table";
import { useEffect } from 'react';
import Home from "./pages/Home";
import Header from "./components/page/Header";
import Footer from "./components/page/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  
  useEffect(() => {
    document.title = process.env.REACT_APP_TITLE || 'Default App Title';
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider theme={Theme}>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home/>} />

              <Route path="signin" element={<SignIn />} />

            {/* Tools Dropdown */}
            <Route path="tools/product-browser" element={<ProductBrowser />} />
            <Route path="tools/product-finder" element={<ProductFinder />} />
            <Route path="tools/advanced-search" element={<AdvancedSearch />} />
            {/* Reports Dropdown */}
            {/* Data Dropdown */}
            <Route path="data/quality" element={<Quality />} />
            <Route path="data/download" element={<Download />} />
            <Route path="data/visualizations" element={<Visualizations />} />

            <Route path="about" element={<About />} />

            {/* Product Detail Page */}
            <Route path="tools/product-browser/:productId" element={<ProductDetail />} />
          </Routes>

          <Footer />
        </div>
      </ThemeProvider>
    </BrowserRouter>

  );
}

export default App;
