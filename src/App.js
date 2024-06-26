// import Table from "./components/Table";
import { useEffect } from 'react';
import Home from "./pages/Home";
import Header from "./components/page/Header";
import Footer from "./components/page/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import Theme from "./components/theme/Theme";
import Batch_browser from "./pages/tools/Batch_browser";
import Product_browser from "./pages/tools/Product_browser";
import Product_detail from "./pages/tools/Product_detail";
import Report_builder from "./pages/tools/Report_builder";
import Category_report from "./pages/reports/Category_report";
import Nutrient_report from "./pages/reports/Nutrient_report";
import Store_report from "./pages/reports/Store_report";
import FOP_report from "./pages/reports/FOP_report";
import Download from "./pages/data/Download";
import Quality from "./pages/data/Quality";
import Visualizations from "./pages/data/Visualizations";
import About from "./pages/About";
import Product_finder from "./pages/tools/Product_finder";
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
            <Route path="tools/product-browser" element={<Product_browser />} />
            <Route path="tools/batch-browser" element={<Batch_browser />} />
            <Route path="tools/report-builder" element={<Report_builder />} />
            <Route path="tools/product-finder" element={<Product_finder />} />
            <Route path="tools/advanced-search" element={<AdvancedSearch />} />
            {/* Reports Dropdown */}
            <Route path="reports/store" element={<Store_report />} />
            <Route path="reports/category" element={<Category_report />} />
            <Route path="reports/nutrient" element={<Nutrient_report />} />
            <Route path="reports/fop" element={<FOP_report />} />
            {/* Data Dropdown */}
            <Route path="data/quality" element={<Quality />} />
            <Route path="data/download" element={<Download />} />
            <Route path="data/visualizations" element={<Visualizations />} />

            <Route path="about" element={<About />} />

            {/* Product Detail Page */}
            <Route path="tools/product-browser/:productId" element={<Product_detail />} />
          </Routes>

          <Footer />
        </div>
      </ThemeProvider>
    </BrowserRouter>

  );
}

export default App;
