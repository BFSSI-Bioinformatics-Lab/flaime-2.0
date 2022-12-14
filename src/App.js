// import Table from "./components/Table";
import Home from "./pages/Home";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Batch_browser from "./pages/tools/Batch_browser";
import Product_browser from "./pages/tools/Product_browser";
import Report_builder from "./pages/tools/Report_builder";
import Category_report from "./pages/reports/Category_report";
import Nutrient_report from "./pages/reports/Nutrient_report";
import Store_report from "./pages/reports/Store_report";
import Download from "./pages/data/Download";
import Quality from "./pages/data/Quality";
import Visualizations from "./pages/data/Visualizations";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home/>} />
          {/* Tools Dropdown */}
          <Route path="tools/product-browser" element={<Product_browser />} />
          <Route path="tools/batch-browser" element={<Batch_browser />} />
          <Route path="tools/report-builder" element={<Report_builder />} />
          {/* Reports Dropdown */}
          <Route path="reports/store" element={<Store_report />} />
          <Route path="reports/category" element={<Category_report />} />
          <Route path="reports/nutrient" element={<Nutrient_report />} />
          {/* Data Dropdown */}
          <Route path="data/quality" element={<Quality />} />
          <Route path="data/download" element={<Download />} />
          <Route path="data/visualizations" element={<Visualizations />} />

          <Route path="about" element={<About />} />
        </Routes>

        
      </div>
    </BrowserRouter>

  );
}

export default App;
