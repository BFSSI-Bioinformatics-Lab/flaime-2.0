import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, TextField, Paper } from '@mui/material';

const Quality = () => {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
          let queryObject;
          if (!isNaN(searchTerm)) {
              queryObject = {
                  "bool": {
                      "should": [
                          {
                              "match": {
                                  "most_recent_flag": {
                                      "query": true
                                  }
                              }
                          },
                          {
                              "match": {
                                  "stores.name": {
                                      "query": searchTerm,
                                      "operator": "or"
                                  }
                              }
                          },
                          {
                              "match": {
                                  "site_name": {
                                      "query": searchTerm,
                                      "operator": "or"
                                  }
                              }
                          },
                          {
                              "term": {
                                  "id": {
                                      "value": searchTerm
                                  }
                              }
                          }
                      ]
                  }
              };
          } else {
              queryObject = {
                  "bool": {
                      "should": [
                          {
                              "match": {
                                  "most_recent_flag": {
                                      "query": true
                                  }
                              }
                          },
                          {
                              "match": {
                                  "stores.name": {
                                      "query": searchTerm,
                                      "operator": "or"
                                  }
                              }
                          },
                          {
                              "match": {
                                  "site_name": {
                                      "query": searchTerm,
                                      "operator": "or"
                                  }
                              }
                          }
                      ]
                  }
              };
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
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };
  

  return (
    <div>
      Quality
      <Paper component="form" className="search-form">
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
        />
      </Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Store Name</TableCell>
              <TableCell>Site URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.stores.name}</TableCell>
                <TableCell>{product.site_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(totalProducts / rowsPerPage)}
        page={page - 1}
        onChange={handleChangePage}
        siblingCount={1}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  )
}

export default Quality