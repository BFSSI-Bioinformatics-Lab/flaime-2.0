import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, TextField, Paper, Typography, Card, CardContent } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import { ResetButton } from '../../../components/buttons';


const Product_browser = () => {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  // const [searchTerm, setSearchTerm] = useState('');
  const [idSearchTerm, setIdSearchTerm] = useState('');
  const [storeNameSearchTerm, setStoreNameSearchTerm] = useState('');
  const [sourceNameSearchTerm, setSourceNameSearchTerm] = useState('');
  const [siteNameSearchTerm, setSiteNameSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const [aggregationResponse, setAggregationResponse] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let queryObject = {
          bool: {
            must: [
              {
                match: {
                  most_recent_flag: {
                    query: true
                  }
                }
              }
            ]
          }
        };
        
        if (idSearchTerm) {
          queryObject.bool.must.push({
            term: {
              id: idSearchTerm
            }
          });
        }
  
        if (storeNameSearchTerm) {
          queryObject.bool.must.push({
            match: {
              "store.name": {
                query: storeNameSearchTerm,
                operator: "and"
              }
            }
          });
        }
  
        if (sourceNameSearchTerm) {
          queryObject.bool.must.push({
            match: {
              "source.name": {
                query: sourceNameSearchTerm,
                operator: "and"
              }
            }
          });
        }
  
        if (siteNameSearchTerm) {
          queryObject.bool.must.push({
            match: {
              site_name: {
                query: siteNameSearchTerm,
                operator: "and"
              }
            }
          });
        }

        if (categorySearchTerm) {
          queryObject.bool.must.push({
            match: {
              "category.name": {
                query: categorySearchTerm,
                operator: "and"
              }
            }
          });
        }
        
        console.log(queryObject);

        const elasticUrl = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
        const response = await axios.post(`${elasticUrl}`, {
          query: queryObject,
          aggs: {
            group_by_store: {
              terms: {
                field: "store.name.keyword"
              },
              aggs: {
                category_search_count: {
                  filter: {
                    term: {
                      "category.name": categorySearchTerm
                    }
                  }
                },
                categories_names_count: {
                  terms: {
                    field: "category.name.keyword"
                  }
                },
                site_name_search_count: {
                  filter: {
                    term: {
                      site_name: siteNameSearchTerm
                    }
                  }
                }
              }
            }
          },
          from: (page - 1) * rowsPerPage,
          size: rowsPerPage
        });
        const hits = response.data.hits.hits;
        setProducts(hits.map(hit => hit._source));
        setTotalProducts(response.data.hits.total.value);
        // Set the aggregation response
        setAggregationResponse(response.data.aggregations);
        
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProducts();
  }, [page, rowsPerPage, idSearchTerm, storeNameSearchTerm, sourceNameSearchTerm, siteNameSearchTerm, categorySearchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  // console.log(aggregationResponse);

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // const handleSearch = event => {
  //   setSearchTerm(event.target.value);
  // };
  const handleIdSearch = event => {
    setIdSearchTerm(event.target.value);
  };

  const handleStoreNameSearch = event => {
    setStoreNameSearchTerm(event.target.value);
  };

  const handleSourceNameSearch = event => {
    setSourceNameSearchTerm(event.target.value);
  };

  const handleSiteNameSearch = event => {
    setSiteNameSearchTerm(event.target.value);
  };
  
  const handleCategorySearch = event => {
    setCategorySearchTerm(event.target.value);
  };
  // Reset search
  const handleReset = () => {
    setIdSearchTerm('');
    setStoreNameSearchTerm('');
    setSourceNameSearchTerm('');
    setSiteNameSearchTerm('');
    setCategorySearchTerm('');
  };

  // Search form submit - disables reset of table when enter is pressed
  const handleSearchFormSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
  };


  return (
    <div style={{ width: '80vw', margin: '0 auto' }}>
    <div>
      <div>
      <Typography variant="h4" style={{ padding: '10px' }}>Product Browser</Typography>
        <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
        Search for products by ID, store name, data source, product name or category. Use the form below to search for products. Note that you can also search by more than one search term at once.<br></br>
        <ul>
            <li>Please use full words when searching.</li>
            <li>If there are over 10000 products as a result of you search, only the first 10000 will be shown.</li>
        </ul>
        </Typography>
      </div>
      <Divider variant="middle"/>
      <div>
      {/* Top row of search bars */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '20px 20px' }}>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px', maxWidth: '300px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search ID"
            variant="outlined"
            value={idSearchTerm}
            onChange={handleIdSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px', maxWidth: '300px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Store Name"
            variant="outlined"
            value={storeNameSearchTerm}
            onChange={handleStoreNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px', maxWidth: '300px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Data Source"
            variant="outlined"
            value={sourceNameSearchTerm}
            onChange={handleSourceNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
      </div>
      

      
      {/* Bottom row of search bars */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '10px 20px' }}>
        <Paper component="form" className="search-form" 
        style={{ flex: 1, marginRight: '5px', maxWidth: '480px'  }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Product Name"
            variant="outlined"
            value={siteNameSearchTerm}
            onChange={handleSiteNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1, maxWidth: '480px'  }} onSubmit={handleSearchFormSubmit}>
              <TextField
                label="Search by category"
                variant="outlined"
                value={categorySearchTerm}
                onChange={handleCategorySearch}
                fullWidth
                size="small"
              />
        </Paper>
        {/* Reset search button */}
        <ResetButton  variant="contained" onClick={handleReset}>Reset Search</ResetButton>
      </div>
      <div>
      {[idSearchTerm, storeNameSearchTerm, sourceNameSearchTerm, siteNameSearchTerm, categorySearchTerm].some(term => term !== '') && (
        
        <Divider style={{ marginTop: '20px', color: '#424242', marginBottom: '15px' }} > 
        Base on your search, there is a total of {totalProducts === 10000 ? "over 10,000" : totalProducts} products. <br></br>
        This is the total per store:
        </Divider>
      )}
      </div>
      {/* card component for number of products per store */}
      <div>
        {/* <Divider style={{ marginTop: '10px', color: '#424242', marginBottom: '10px' }} >
                Based on your search, these are the number of products per store:
            </Divider> */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', maxWidth: '880px', margin: '0 auto' }}>
              {aggregationResponse && aggregationResponse.group_by_store.buckets.slice(0, 4).map((store, index) => (
                <Card key={store.key} style={{ flex: '1 0 calc(25% - 10px)', maxWidth: '180px', boxSizing: 'border-box', textAlign: 'center', marginBottom: '10px' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" style={{ fontSize: '14px' }}>
                      {store.key}
                    </Typography>
                    <Typography color="textSecondary">
                      {store.doc_count}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              {aggregationResponse && aggregationResponse.group_by_store.buckets.slice(4).map((store, index) => (
                <Card key={store.key} style={{ flex: '1 0 calc(25% - 10px)', maxWidth: '180px', boxSizing: 'border-box', textAlign: 'center', marginBottom: '10px' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" style={{ fontSize: '14px' }}>
                      {store.key}
                    </Typography>
                    <Typography color="textSecondary">
                      {store.doc_count}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      
      
      </div>
      <TableContainer style={{ width: '80vw', margin: '0 auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Assigned Flaime ID</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Store Name</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Data Source</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Product Name</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Category Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.id} style={{ background: index % 2 === 0 ? '#f2f2f2' : 'white'}}>
                <TableCell style={{ width: '80px', textAlign: 'center' }}>
                <Link to={`/tools/product-browser/${product.id}`} target="_blank">{product.id}</Link></TableCell>
                <TableCell style={{ textAlign: 'center' }}>{product.store.name}</TableCell>
                <TableCell style={{ width: '140px', textAlign: 'center' }}>{product.source.name}</TableCell>
                <TableCell style={{ width: '375px' }}>{product.site_name}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>
                  {product.category && product.category.name ? product.category.name : 'No category'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(totalProducts / rowsPerPage -1)}
        page={page - 1}
        onChange={handleChangePage}
        siblingCount={1}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      
    </div>
    </div>
  )
}

export default Product_browser