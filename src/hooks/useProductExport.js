import { useState } from 'react';
import axios from 'axios';

// Escapes fields for CSV format to handle commas, newlines, and quotes.
const escapeCsvField = (field) => {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  if (stringField.includes(",") || stringField.includes("\"") || stringField.includes("\n")) {
      return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

// Extracts a human-readable string from various field formats (string, array, object).
const extractTextValue = (val) => {
  if (val === null || val === undefined) return "";
  
  // Array
  if (Array.isArray(val)) {
    return val.map(item => {
      if (typeof item === 'object') {
        // Try common fields for text representation, or fallback to JSON stringification
        return item.contains_en || item.en || item.name || item.value || item.description || JSON.stringify(item);
      }
      return item;
    }).filter(str => str && str !== "null").join(", ");
  }

  // Object
  if (typeof val === 'object') {
    return val.en || val.name || val.value || val.description || JSON.stringify(val);
  }

  // Simple value
  return val;
};

// Generates a blob link and triggers the download in the browser
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to download");
    return;
  }
  
  // Create CSV content
  const csvContent = data.map(e => e.join(",")).join("\n");

  // Create Blob object (virtual file in memory)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create URL for Blob and link element
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up the URL object
};

/**
 * Scans all fetched products to collect a unique list of nutrient names.
 * This is used to create dynamic columns for the "Full" export option.
 */
const getAllNutrientNames = (allProducts) => {
  const nutrients = new Set();
  allProducts.forEach(p => {
    if (p.nutrition_details) {
      p.nutrition_details.forEach(n => {
        const unit = n.unit ? ` (${n.unit})` : '';
        nutrients.add(`${n.nutrient_name}${unit}`);
      });
    }
  });
  return Array.from(nutrients).sort();
};

// Main hook

export const useProductExport = (queryBody, totalProducts) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openDownloadMenu = Boolean(anchorEl);
  
  // Sensible limit to prevent browser crashes or server overload
  const DOWNLOAD_LIMIT = 5000;

  const handleDownloadClick = (event) => setAnchorEl(event.currentTarget);
  const handleDownloadClose = () => setAnchorEl(null);

  /**
   * Fetches all matching results from the API up to the DOWNLOAD_LIMIT.
   * Uses the existing 'queryBody' but overrides 'from' and 'size'.
   */
  const fetchAllDataForExport = async () => {
    // Check Limit
    if (totalProducts > DOWNLOAD_LIMIT) {
      alert(`Export is limited to ${DOWNLOAD_LIMIT} results. Your search has ${totalProducts}.\nPlease contact us for a customized export.`);
      handleDownloadClose();
      return null;
    }

    // Prepare Request Body (Fetch All)
    const body = {
      query: queryBody,
      from: 0,
      size: Math.min(totalProducts || 0, DOWNLOAD_LIMIT)
    };

    const elasticUrl = `${process.env.REACT_APP_ELASTIC_URL}/_search`;

    try {
      const axiosInstance = axios.create();
      const response = await axiosInstance.post(elasticUrl, body, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      });
      return response.data.hits.hits.map(hit => hit._source);
    } catch (error) {
      console.error("Export fetch failed", error);
      alert("Failed to fetch data for export.");
      return null;
    }
  };

  // Handles "Simple" CSV download (Fixed columns).
  const handleDownloadSimple = async (filenamePrefix) => {
    const allData = await fetchAllDataForExport();
    if (!allData) return;

    // Fixed headers based on UI table
    const header = ['Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name', 'Category Name'];
    const rows = allData.map(product => [
      escapeCsvField(product.id),
      escapeCsvField(product.external_id),
      escapeCsvField(product.store?.name),
      escapeCsvField(product.source?.name),
      escapeCsvField(product.site_name),
      escapeCsvField(product.categories?.map(c => c.name).join(' > '))
    ]);

    downloadCSV([header, ...rows], `${filenamePrefix}_simple_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  // Handles "Full" CSV download (Includes flattened nutrition data).
  const handleDownloadFull = async (filenamePrefix) => {
    const allData = await fetchAllDataForExport();
    if (!allData) return;

    // Collect all dynamic nutrient columns
    const nutrientColumns = getAllNutrientNames(allData);

    // Prepare Headers
    const header = [
      'Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name', 
      'Category Name', 'UPC', 'Ingredients (EN)', 
      'Storage', 'Primary Packaging', 'Secondary Packaging', 'Allergens',
      'Total Size', 'Serving Size',
      ...nutrientColumns 
    ];

    // Map Data (Flattening)
    const rows = allData.map(product => {
      // Create a map for O(1) access to nutrients for this product
      const nutrientMap = {};
      if (product.nutrition_details) {
        product.nutrition_details.forEach(n => {
          const unit = n.unit ? ` (${n.unit})` : '';
          nutrientMap[`${n.nutrient_name}${unit}`] = n.amount;
        });
      }

      let allergenText = "";
      if (product.allergens_warnings && Array.isArray(product.allergens_warnings)) {
          const validTexts = product.allergens_warnings
              .flatMap(w => [w.contains_en, w.may_contain_en])
              .filter(text => text);
          allergenText = [...new Set(validTexts)].join("; ");
      }

      const baseData = [
        escapeCsvField(product.id),
        escapeCsvField(product.external_id),
        escapeCsvField(product.store?.name),
        escapeCsvField(product.source?.name),
        escapeCsvField(product.site_name),
        escapeCsvField(product.categories?.map(c => c.name).join(' > ')),
        escapeCsvField(product.raw_upc),
        escapeCsvField(product.ingredients?.en),
        escapeCsvField(extractTextValue(product.storage_condition)),
        escapeCsvField(extractTextValue(product.primary_package_material)),
        escapeCsvField(extractTextValue(product.secondary_package_material)),
        escapeCsvField(allergenText),
        escapeCsvField(product.total_size),
        escapeCsvField(product.raw_serving_size),
      ];

      // Fill in nutrient data in the correct order
      const nutrientData = nutrientColumns.map(colName => escapeCsvField(nutrientMap[colName] || ""));
      return [...baseData, ...nutrientData];
    });

    downloadCSV([header, ...rows], `${filenamePrefix}_full_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  return {
    anchorEl,
    openDownloadMenu,
    handleDownloadClick,
    handleDownloadClose,
    handleDownloadSimple,
    handleDownloadFull
  };
};