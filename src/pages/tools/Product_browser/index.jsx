import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Pagination, TextField, Paper, Typography, Card, CardContent, Divider, Button, Menu, MenuItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import SourceSelector from '../../../components/inputs/SourceSelector';
import { ResetButton } from '../../../components/buttons';

// CSV downloal function
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to download");
    return;
  }
  const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.join(",")).join("\n");
      
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Handle CSV field escaping
const escapeCsvField = (field) => {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  if (stringField.includes(",") || stringField.includes("\"") || stringField.includes("\n")) {
      return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

// Get all unique nutrient names from products
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
  return Array.from(nutrients).sort(); // Sort for alphabetical order
};

const ProductBrowser = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerms, setSearchTerms] = useState({
    id: '',
    storeName: '',
    sourceName: '',
    siteName: '',
    category: ''
  });
  const [aggregationResponse, setAggregationResponse] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Download menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const openDownloadMenu = Boolean(anchorEl);
  const DOWNLOAD_LIMIT = 5000; // Sensible Limit

  // Handle download menu open/close
  const handleDownloadClick = (event) => setAnchorEl(event.currentTarget);
  const handleDownloadClose = () => setAnchorEl(null);

  // Fetch all data for export (with limit check)
  const fetchAllDataForExport = async () => {
    if (totalProducts > DOWNLOAD_LIMIT) {
      alert(`Export is limited to ${DOWNLOAD_LIMIT} results. Your search has ${totalProducts}.\nPlease contact us for a customized export.`);
      handleDownloadClose();
      return null;
    }

    const elasticUrl = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
    // Reuse buildQueryObject function, and set size to totalProducts or DOWNLOAD_LIMIT
    const body = {
      query: buildQueryObject(),
      from: 0,
      size: Math.min(totalProducts, DOWNLOAD_LIMIT)
    };

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

  // Simple Download Handler (Visible Columns)
  const handleDownloadSimple = async () => {
    const allData = await fetchAllDataForExport();
    if (!allData) return;

    const header = ['Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name', 'Category Name'];
    const rows = allData.map(product => [
      escapeCsvField(product.id),
      escapeCsvField(product.external_id),
      escapeCsvField(product.store?.name),
      escapeCsvField(product.source?.name),
      escapeCsvField(product.site_name),
      escapeCsvField(product.categories?.map(c => c.name).join(' > '))
    ]);

    downloadCSV([header, ...rows], `product_browser_simple_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  // Full Download Handler (All Data)
  const handleDownloadFull = async () => {
    const allData = await fetchAllDataForExport();
    if (!allData) return;

    // All unique nutrient columns
    const nutrientColumns = getAllNutrientNames(allData);

    // Header row
    const header = [
      'Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name', 
      'Category Name', 'UPC', 'Ingredients (EN)', 'Total Size', 'Serving Size',
      ...nutrientColumns 
    ];

    // Data Mapping
    const rows = allData.map(product => {
      // Nutrient name to amount mapping
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

      // Nutrient data in order of nutrientColumns
      const nutrientData = nutrientColumns.map(colName => 
        escapeCsvField(nutrientMap[colName] || "")
      );

      return [...baseData, ...nutrientData];
    });

    downloadCSV([header, ...rows], `product_browser_full_${new Date().toISOString().slice(0,10)}.csv`);
    handleDownloadClose();
  };

  const fetchData = useCallback(async (url, body) => {
    try {
      const axiosInstance = axios.create();
      const response = await axiosInstance.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      });
      setProducts(response.data.hits.hits.map(hit => hit._source));
      setTotalProducts(response.data.hits.total.value);
      setAggregationResponse(response.data.aggregations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const buildQueryObject = useCallback(() => {
    const queryObject = {
      bool: {
        must: [{ match: { most_recent_flag: { query: true } } }]
      }
    };

    Object.entries(searchTerms).forEach(([key, value]) => {
      if (value) {
        const fieldMapping = {
          id: { term: { id: value } },
          external_id: { term: { external_id: value } },
          storeName: { match: { "store.name": { query: value, operator: "and" } } },
          sourceName: { term: { "source.id": value } },
          siteName: { match: { site_name: { query: value, operator: "and" } } },
          category: {
            nested: {
              path: "categories",
              query: {
                match: { "categories.name": { query: value, operator: "and" } }
              }
            }
          }
        };
        queryObject.bool.must.push(fieldMapping[key]);
      }
    });
    console.log(queryObject);
    return queryObject;
  }, [searchTerms]);

  const buildAggregations = useCallback(() => {
    const filters = Object.entries(searchTerms)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        const fieldMapping = {
          id: { term: { id: value } },
          external_id: { term: { external_id: value } },
          storeName: { match: { "store.name": { query: value, operator: "and" } } },
          sourceName: { term: { "source.id": value } },
          siteName: { match: { site_name: { query: value, operator: "and" } } },
        category: {
          nested: {
            path: "categories",
            query: {
              match: { "categories.name": { query: value, operator: "and" } }
            }
          }
        }
      };
        return fieldMapping[key];
      });

    return {
      group_by_store: {
        filter: { bool: { must: filters } },
        aggs: {
          store_bucket: {
            terms: { 
              field: "store.name.keyword",
              size: 100
            }
          }
        }
      }
    };
  }, [searchTerms]);

  const fetchProducts = useCallback(() => {
    const elasticUrl = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
    const body = {
      query: buildQueryObject(),
      aggs: buildAggregations(),
      from: (page - 1) * rowsPerPage,
      size: rowsPerPage
    };
    fetchData(elasticUrl, body);
  }, [fetchData, buildQueryObject, buildAggregations, page, rowsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = useCallback((field) => (event) => {
    setSearchTerms(prev => ({ ...prev, [field]: event.target.value }));
    setPage(1);
    setIsSearching(true);
  }, []);

  const handleSourceNameSearch = useCallback((selectedSource) => {
    setSearchTerms(prev => ({ ...prev, sourceName: selectedSource === '-1' ? '' : selectedSource }));
    setPage(1);
    setIsSearching(true);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerms({ id: '', storeName: '', sourceName: '', siteName: '', category: '' });
    setPage(1);
    setIsSearching(false);
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div style={{ width: '80vw', margin: '0 auto' }}>
      <Typography variant="h4" style={{ padding: '10px' }}>Product Browser</Typography>
      <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
        Search for products by ID, external ID (e.g. FLIP product ID), store name, data source, product name or category. Use the form below to search for products. Note that you can also search by more than one search term at once.
        <ul>
          <li>Please use full words when searching.</li>
          <li>If there are over 10000 products as a result of your search, only the first 10000 will be shown.</li>
        </ul>
      </Typography>
      <Divider variant="middle" />

      <SearchForm
        searchTerms={searchTerms}
        handleSearchChange={handleSearchChange}
        handleSourceNameSearch={handleSourceNameSearch}
        handleReset={handleReset}
        anchorEl={anchorEl}
        openDownloadMenu={openDownloadMenu}
        handleDownloadClick={handleDownloadClick}
        handleDownloadClose={handleDownloadClose}
        handleDownloadSimple={handleDownloadSimple}
        handleDownloadFull={handleDownloadFull}
      />

      <StoreCards aggregationResponse={aggregationResponse} />

      {isSearching && (
        <SearchResults totalProducts={totalProducts} />
      )}

      <ProductTable products={products} />

      <Pagination
        count={Math.ceil(totalProducts / rowsPerPage)}
        page={page}
        onChange={(_, newPage) => setPage(newPage)}
        siblingCount={1}
      />
    </div>
  );
};

const SearchForm = React.memo(({ searchTerms, handleSearchChange, handleSourceNameSearch, handleReset,
  anchorEl, openDownloadMenu, handleDownloadClick, handleDownloadClose, handleDownloadSimple, handleDownloadFull }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px 20px', alignItems: 'center' }}>
      <SearchField label="Search ID" value={searchTerms.id} onChange={handleSearchChange('id')} />
      <SearchField label="External ID" value={searchTerms.external_id} onChange={handleSearchChange('external_id')} />
      <SearchField label="Search by Store Name" value={searchTerms.storeName} onChange={handleSearchChange('storeName')} />
      <SourceSelector
        value={searchTerms.sourceName}
        onSelect={handleSourceNameSearch}
        showTitle={false}
        label="Search by Data Source"
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '10px 20px' }}>
      <SearchField label="Search by Product Name" value={searchTerms.siteName} onChange={handleSearchChange('siteName')} style={{ maxWidth: '480px' }} />
      <SearchField label="Search by category" value={searchTerms.category} onChange={handleSearchChange('category')} style={{ maxWidth: '480px' }} />
      <div style={{ display: 'flex', gap: '10px' }}>
        <ResetButton variant="contained" onClick={handleReset}>Reset Search</ResetButton>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleDownloadClick}
        >
          Download Results
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openDownloadMenu}
          onClose={handleDownloadClose}
        >
          <MenuItem onClick={handleDownloadSimple}>Simple CSV (Visible Columns)</MenuItem>
          <MenuItem onClick={handleDownloadFull}>Full CSV (All Data)</MenuItem>
        </Menu>
      </div>
    </div>
  </div>
));

const SearchField = React.memo(({ label, value, onChange, style = {} }) => (
  <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px', maxWidth: '300px', boxShadow: 'none', ...style }} onSubmit={(e) => e.preventDefault()}>
    <TextField
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
      fullWidth
    />
  </Paper>
));

const StoreCards = React.memo(({ aggregationResponse }) => {
  const stores = aggregationResponse?.group_by_store?.store_bucket?.buckets || [];

  return (
    <div>
      <Divider style={{ marginTop: '20px', color: '#424242', marginBottom: '15px' }}>
        Products per store:
      </Divider>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', maxWidth: '880px', margin: '0 auto' }}>
        {stores.map((store) => (
          <Card key={store.key} style={{ flex: '1 0 calc(25% - 10px)', maxWidth: '180px', boxSizing: 'border-box', textAlign: 'center', marginBottom: '10px' }}>
            <CardContent>
              <Typography variant="h6" component="h2" style={{ fontSize: '14px' }}>
                {store.key}
              </Typography>
              <Typography color="textSecondary">
                {store.doc_count.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

const SearchResults = React.memo(({ totalProducts }) => (
  <div>
    <Divider style={{ marginTop: '20px', color: '#424242', marginBottom: '15px' }}>
      Based on your search, there is a total of {totalProducts === 10000 ? "over 10,000" : totalProducts} products.
    </Divider>
  </div>
));

const ProductTable = React.memo(({ products }) => (
  <TableContainer style={{ width: '80vw', margin: '0 auto' }}>
    <Table>
      <TableHead>
        <TableRow>
          {['Assigned Flaime ID', 'External ID', 'Store Name', 'Data Source', 'Product Name', 'Category Name'].map((header) => (
            <TableCell key={header} style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={product.id} style={{ background: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
            <TableCell style={{ width: '80px', textAlign: 'center' }}>
              <Link to={`/tools/product-browser/${product.id}`} target="_blank">{product.id}</Link>
            </TableCell>
            <TableCell style={{ textAlign: 'center' }}>{product.external_id}</TableCell>
            <TableCell style={{ textAlign: 'center' }}>{product.store.name}</TableCell>
            <TableCell style={{ width: '140px', textAlign: 'center' }}>{product.source.name}</TableCell>
            <TableCell style={{ width: '375px' }}>{product.site_name}</TableCell>
            <TableCell style={{ textAlign: 'left' }}>
              {product.categories && product.categories.length > 0
                ? product.categories
                    .sort((a, b) => a.level - b.level)
                    .map(cat => cat.name)
                    .join(' > ')
                : 'No category'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));
export default ProductBrowser;