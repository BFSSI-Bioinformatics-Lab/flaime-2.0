// quality page

import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, TextField, Paper } from '@mui/material';
import PageContainer from '../../components/page/PageContainer';
import { Link } from 'react-router-dom';


const Quality = () => {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  // const [searchTerm, setSearchTerm] = useState('');
  const [idSearchTerm, setIdSearchTerm] = useState('');
  const [storeNameSearchTerm, setStoreNameSearchTerm] = useState('');
  const [sourceNameSearchTerm, setSourceNameSearchTerm] = useState('');
  const [siteNameSearchTerm, setSiteNameSearchTerm] = useState('');

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
              "stores.name": {
                query: storeNameSearchTerm,
                operator: "and"
              }
            }
          });
        }
  
        if (sourceNameSearchTerm) {
          queryObject.bool.must.push({
            match: {
              "sources.name": {
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
  
        const response = await axios.post('http://172.17.10.96:9200/data_v1/_search', {
          query: queryObject,
          from: (page - 1) * rowsPerPage,
          size: rowsPerPage
        });
        const hits = response.data.hits.hits;
        setProducts(hits.map(hit => hit._source));
        setTotalProducts(response.data.hits.total.value);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProducts();
  }, [page, rowsPerPage, idSearchTerm, storeNameSearchTerm, sourceNameSearchTerm, siteNameSearchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

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
  
  // Reset search
  const handleReset = () => {
    setIdSearchTerm('');
    setStoreNameSearchTerm('');
    setSourceNameSearchTerm('');
    setSiteNameSearchTerm('');
  };

  // Search form submit - disables reset of table when enter is pressed
  const handleSearchFormSubmit = (event) => {
    event.preventDefault(); // Prevent form submission
  };

  return (
    <PageContainer>
    <div>
      Quality
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search ID"
            variant="outlined"
            value={idSearchTerm}
            onChange={handleIdSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Store Name"
            variant="outlined"
            value={storeNameSearchTerm}
            onChange={handleStoreNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Data Source"
            variant="outlined"
            value={sourceNameSearchTerm}
            onChange={handleSourceNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <Paper component="form" className="search-form" style={{ flex: 1 }} onSubmit={handleSearchFormSubmit}>
          <TextField
            label="Search by Produt Name"
            variant="outlined"
            value={siteNameSearchTerm}
            onChange={handleSiteNameSearch}
            fullWidth
            size="small"
          />
        </Paper>
        <button onClick={handleReset}>Reset Search</button>
      </div>
      <TableContainer style={{ width: '80vw', margin: '0 auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Assigned Flaime ID</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Store Name</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Data Source</TableCell>
              <TableCell style={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>Product Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell style={{ width: '80px', textAlign: 'center' }}>
                <Link to={`/tools/product-browser/${product.id}`} target="_blank">{product.id}</Link></TableCell>
                <TableCell style={{ textAlign: 'center' }}>{product.stores.name}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{product.sources.name}</TableCell>
                <TableCell style={{ width: '500px' }}>{product.site_name}</TableCell>
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
      <div>Total Products: {totalProducts === 10000 ? "over 10,000" : totalProducts}</div>
    </div>
    </PageContainer>
  )
}

export default Quality