import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Pagination, TextField, Paper, Typography, Card, CardContent, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import SourceSelector from '../../../components/inputs/SourceSelector';
import { ResetButton } from '../../../components/buttons';

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
          storeName: { match: { "store.name": { query: value, operator: "and" } } },
          sourceName: { term: { "source.id": value } },
          siteName: { match: { site_name: { query: value, operator: "and" } } },
          category: { match: { "category.name": { query: value, operator: "and" } } }
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
          storeName: { match: { "store.name": { query: value, operator: "and" } } },
          sourceName: { term: { "source.id": value } },
          siteName: { match: { site_name: { query: value, operator: "and" } } },
          category: { match: { "category.name": { query: value, operator: "and" } } }
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
        Search for products by ID, store name, data source, product name or category. Use the form below to search for products. Note that you can also search by more than one search term at once.
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

const SearchForm = React.memo(({ searchTerms, handleSearchChange, handleSourceNameSearch, handleReset }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px 20px', alignItems: 'center' }}>
      <SearchField label="Search ID" value={searchTerms.id} onChange={handleSearchChange('id')} />
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
      <ResetButton variant="contained" onClick={handleReset}>Reset Search</ResetButton>
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
          {['Assigned Flaime ID', 'Store Name', 'Data Source', 'Product Name', 'Category Name'].map((header) => (
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
            <TableCell style={{ textAlign: 'center' }}>{product.store.name}</TableCell>
            <TableCell style={{ width: '140px', textAlign: 'center' }}>{product.source.name}</TableCell>
            <TableCell style={{ width: '375px' }}>{product.site_name}</TableCell>
            <TableCell style={{ textAlign: 'center' }}>
              {product.category ? product.category : 'No category'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

export default ProductBrowser;