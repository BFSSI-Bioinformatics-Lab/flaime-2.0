import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Pagination, TextField, Paper, Typography, Card, CardContent, Divider, TableSortLabel
} from '@mui/material';
import { Link } from 'react-router-dom';
import SourceSelector from '../../../components/inputs/SourceSelector';
import { ResetButton } from '../../../components/buttons/ResetButton';
import { DownloadResultButton } from '../../../components/buttons/DownloadResultButton';
import { buildProductNameClause } from '../util';

const SORTABLE_ES_FIELDS = {
  id: 'id',
  external_id: 'external_id.keyword',
  store: 'store.name.keyword',
  source: 'source.name.keyword',
  name: 'site_name.keyword',
};

// Returns the ES clause for a single search field. Evaluated lazily per key so
// that e.g. buildProductNameClause (which lowercases its input) is never called
// with a non-string value such as the numeric source id.
const buildFieldClause = (key, value) => {
  switch (key) {
    case 'id':
      return { term: { id: value } };
    case 'external_id':
      return { term: { external_id: value } };
    case 'storeName':
      return { match: { "store.name": { query: value, operator: "and" } } };
    case 'sourceName':
      return { term: { "source.id": value } };
    case 'siteName':
      return buildProductNameClause(value);
    case 'category':
      return {
        nested: {
          path: "categories",
          query: { match: { "categories.name": { query: value, operator: "and" } } }
        }
      };
    default:
      return null;
  }
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
  const [sortState, setSortState] = useState({ field: null, order: 'asc' });

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
        const clause = buildFieldClause(key, value);
        if (clause) queryObject.bool.must.push(clause);
      }
    });
    return queryObject;
  }, [searchTerms]);

  const buildAggregations = useCallback(() => {
    const filters = Object.entries(searchTerms)
      .filter(([, value]) => value)
      .map(([key, value]) => buildFieldClause(key, value))
      .filter(Boolean);

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
    const sort = sortState.field ? [{ [SORTABLE_ES_FIELDS[sortState.field]]: { order: sortState.order } }] : undefined;
    const body = {
      query: buildQueryObject(),
      aggs: buildAggregations(),
      from: (page - 1) * rowsPerPage,
      size: rowsPerPage,
      ...(sort ? { sort } : {}),
    };
    fetchData(elasticUrl, body);
  }, [fetchData, buildQueryObject, buildAggregations, page, rowsPerPage, sortState]);

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

  const handleSortChange = useCallback((field) => {
    setSortState(prev => {
      const newOrder = prev.field === field && prev.order === 'asc' ? 'desc' : 'asc';
      return { field, order: newOrder };
    });
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerms({ id: '', storeName: '', sourceName: '', siteName: '', category: '' });
    setPage(1);
    setIsSearching(false);
    setSortState({ field: null, order: 'asc' });
  }, []);

  const currentQueryBody = buildQueryObject();

  return (
    <div style={{ width: '80vw', margin: '0 auto' }}>
      <Typography variant="h4" style={{ padding: '10px' }}>Product Browser</Typography>
      <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
        Search for products by ID, external ID (e.g. FLIP product ID), store name, data source, product name or category. Use the form below to search for products. Note that you can also search by more than one search term at once.
        <ul>
          <li>Product name search supports fuzzy and partial matching (e.g. "cone" will also match "cones", and "School" will match "SchoolSafe").</li>
          <li>If there are over 10000 products as a result of your search, only the first 10000 will be shown.</li>
        </ul>
      </Typography>
      <Divider variant="middle" />

      <SearchForm
        searchTerms={searchTerms}
        handleSearchChange={handleSearchChange}
        handleSourceNameSearch={handleSourceNameSearch}
        handleReset={handleReset}
        queryBody={currentQueryBody}
        totalProducts={totalProducts}
      />

      <StoreCards aggregationResponse={aggregationResponse} />

      {isSearching && (
        <SearchResults totalProducts={totalProducts} />
      )}

      <ProductTable products={products} sortField={sortState.field} sortOrder={sortState.order} onSortChange={handleSortChange} />

      <Pagination
        count={Math.ceil(totalProducts / rowsPerPage)}
        page={page}
        onChange={(_, newPage) => setPage(newPage)}
        siblingCount={1}
      />
    </div>
  );
};

const SearchForm = React.memo(({ searchTerms, handleSearchChange, handleSourceNameSearch, handleReset, queryBody, totalProducts}) => (
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
        <DownloadResultButton queryBody={queryBody} totalProducts={totalProducts} fileNamePrefix="product_browser" />
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

const BROWSER_COLUMNS = [
  { header: 'Assigned Flaime ID', field: 'id' },
  { header: 'External ID', field: 'external_id' },
  { header: 'Store Name', field: 'store' },
  { header: 'Data Source', field: 'source' },
  { header: 'Product Name', field: 'name' },
  { header: 'Category Name', field: null },
];

const ProductTable = React.memo(({ products, sortField, sortOrder, onSortChange }) => (
  <TableContainer style={{ width: '80vw', margin: '0 auto' }}>
    <Table>
      <TableHead>
        <TableRow>
          {BROWSER_COLUMNS.map(({ header, field }) => (
            <TableCell key={header} style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
              {field && onSortChange ? (
                <TableSortLabel
                  active={sortField === field}
                  direction={sortField === field ? sortOrder : 'asc'}
                  onClick={() => onSortChange(field)}
                >
                  {header}
                </TableSortLabel>
              ) : header}
            </TableCell>
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
            <TableCell style={{ textAlign: 'center' }}>{product.store?.name ?? '—'}</TableCell>
            <TableCell style={{ width: '140px', textAlign: 'center' }}>{product.source?.name ?? '—'}</TableCell>
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