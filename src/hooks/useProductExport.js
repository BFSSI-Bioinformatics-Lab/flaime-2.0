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

// Supplemented food label flags: [db field on product.label_flags, human-readable CSV column].
// Order and labels mirror the SupplementedFoodFlags component and the backend export.
const SUPP_FOOD_FLAGS = [
  ['has_supplemental_caution_id', 'Supplemental Caution'],
  ['has_nutrient_content_claim', 'Nutrient Content Claim'],
  ['has_nutrient_function_claim', 'Nutrient Function Claim'],
  ['has_disease_risk_reduction_claim', 'Disease Risk Reduction Claim'],
  ['has_probiotic_claim', 'Probiotic Claim'],
  ['has_therapeutic_claim', 'Therapeutic Claim'],
  ['has_function_claim', 'Function Claim'],
  ['has_general_health_claim', 'General Health Claim'],
  ['has_quantitative_nutrient_declaration', 'Quantitative Nutrient Declaration'],
  ['has_implied_nonspecific_claim', 'Implied Nonspecific Claim'],
  ['has_logos_icons', 'Logos/Icons'],
  ['has_third_party_label', 'Third Party Label'],
];

/**
 * Builds the header row and data rows for the "Full" export
 * (base product fields + flattened nutrition data). Rows are returned in the
 * same order as `allData` so callers can append per-product columns by index.
 */
const buildFullExportRows = (allData) => {
  const nutrientColumns = getAllNutrientNames(allData);

  const header = [
    'Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name',
    'Category Name', 'UPC', 'Ingredients (EN)', 'Total Size', 'Serving Size',
    ...nutrientColumns
  ];

  const rows = allData.map(product => {
    // Create a map for O(1) access to nutrients for this product
    const nutrientMap = {};
    if (product.nutrition_details) {
      product.nutrition_details.forEach(n => {
        const unit = n.unit ? ` (${n.unit})` : '';
        nutrientMap[`${n.nutrient_name}${unit}`] = n.amount;
      });
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
      escapeCsvField(product.total_size),
      escapeCsvField(product.raw_serving_size),
    ];

    // Fill in nutrient data in the correct order
    const nutrientData = nutrientColumns.map(colName => escapeCsvField(nutrientMap[colName] || ""));
    return [...baseData, ...nutrientData];
  });

  return { header, rows };
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

    const { header, rows } = buildFullExportRows(allData);

    downloadCSV([header, ...rows], `${filenamePrefix}_full_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  // Handles "Full + Supplemented Food Flags" CSV download.
  // Same as the Full export, with the supplemented-food label flags appended as columns.
  const handleDownloadSupplemented = async (filenamePrefix) => {
    const allData = await fetchAllDataForExport();
    if (!allData) return;

    const { header, rows } = buildFullExportRows(allData);

    // Append the supplemented-food indicator and one column per label flag.
    const suppHeader = [...header, 'Supplemented Food', ...SUPP_FOOD_FLAGS.map(([, label]) => label)];

    const suppRows = rows.map((row, i) => {
      const product = allData[i];
      const flags = product.label_flags;
      const isSupplemented = product.supplemented_food === true || Boolean(flags);

      // Non-supplemented products have no flags row: leave the flag columns blank.
      const flagValues = SUPP_FOOD_FLAGS.map(([key]) =>
        flags ? escapeCsvField(flags[key] ? 'Yes' : 'No') : ''
      );

      return [...row, escapeCsvField(isSupplemented ? 'Yes' : 'No'), ...flagValues];
    });

    downloadCSV([suppHeader, ...suppRows], `${filenamePrefix}_supplemented_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  return {
    anchorEl,
    openDownloadMenu,
    handleDownloadClick,
    handleDownloadClose,
    handleDownloadSimple,
    handleDownloadFull,
    handleDownloadSupplemented
  };
};