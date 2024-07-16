// This gets all the products using the scroll api. 
// Search and pagination FORWARD is functional

import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, TextField, Paper } from '@mui/material';
import PageContainer from '../../components/page/PageContainer';



const Download = () => {
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  // const [searchTerm, setSearchTerm] = useState('');
  const [idSearchTerm, setIdSearchTerm] = useState('');
  const [storeNameSearchTerm, setStoreNameSearchTerm] = useState('');
  const [sourceNameSearchTerm, setSourceNameSearchTerm] = useState('');
  const [siteNameSearchTerm, setSiteNameSearchTerm] = useState('');
  const [scrollId, setScrollId] = useState(null);

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
        // if (!idSearchTerm && !storeNameSearchTerm && !sourceNameSearchTerm && !siteNameSearchTerm) {
        //   queryObject.bool.should.push({
        //     term: {
        //       most_recent_flag: {
        //         value: true
        //       }
        //     }
        //   });}
  
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
  
        const response = await axios.post('http://172.17.10.96:9200//_search?scroll=1m', {
          query: queryObject,
          // from: (page - 1) * rowsPerPage,
          size: rowsPerPage
        });
        
        let hits = response.data.hits.hits;
        let totalHits = response.data.hits.total.value;

        // Process the initial hits
        let products = hits.map(hit => hit._source);
        setProducts(products);
        setTotalProducts(totalHits);

        const scrollId = response.data._scroll_id;
        setScrollId(scrollId); // Save the scroll ID

        // Implement pagination logic for fetching more data
        // let scrollId = response.data._scroll_id;
        // while (hits.length < totalHits) {
        //     const scrollResponse = await axios.post('http://172.17.10.96:9200/_search/scroll', {
        //         scroll: '1m',
        //         scroll_id: scrollId
        //     });
        //     hits = scrollResponse.data.hits.hits;
        //     products = hits.map(hit => hit._source);
        //     setProducts(prevProducts => [...prevProducts, ...products]);
        // }

      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProducts();
  }, [page, rowsPerPage, idSearchTerm, storeNameSearchTerm, sourceNameSearchTerm, siteNameSearchTerm]);

  const fetchNextPage = async () => {
    try {
        const scrollResponse = await axios.post('http://172.17.10.96:9200/_search/scroll', {
            scroll: '1m',
            scroll_id: scrollId
        });

        let hits = scrollResponse.data.hits.hits;
        let products = hits.map(hit => hit._source);
        setProducts(products);

        let newScrollId = scrollResponse.data._scroll_id;
        setScrollId(newScrollId);

        // setPage(prevPage => prevPage + 1); // Increment page number
    } catch (error) {
        console.error(error);
    }
};

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  
  // const handleChangePage = (event, value) => {
  //   if (value > page) {
  //       fetchNextPage();
        
  //   } else {
  //       setPage(value); // Update page number when pagination number is clicked
        
  //   }
  // };
  
  const handleNextPage = () => {
    fetchNextPage();
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };


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
  
  return (
    <div>
      <h2>Download Page</h2>
      <h4>Scroll Used in this page = loads all products</h4>
      <hr></hr>
      <PageContainer>
        <div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }}>
              <TextField
                label="Search ID"
                variant="outlined"
                value={idSearchTerm}
                onChange={handleIdSearch}
                fullWidth
                size="small"
              />
            </Paper>
            <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }}>
              <TextField
                label="Search Store Name"
                variant="outlined"
                value={storeNameSearchTerm}
                onChange={handleStoreNameSearch}
                fullWidth
                size="small"
              />
            </Paper>
            <Paper component="form" className="search-form" style={{ flex: 1, marginRight: '5px' }}>
              <TextField
                label="Search Source Name"
                variant="outlined"
                value={sourceNameSearchTerm}
                onChange={handleSourceNameSearch}
                fullWidth
                size="small"
              />
            </Paper>
            <Paper component="form" className="search-form" style={{ flex: 1 }}>
              <TextField
                label="Search Site Name"
                variant="outlined"
                value={siteNameSearchTerm}
                onChange={handleSiteNameSearch}
                fullWidth
                size="small"
              />
            </Paper>
          </div>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Store Name</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Product Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.stores.name}</TableCell>
                    <TableCell>{product.sources.name}</TableCell>
                    <TableCell>{product.site_name}</TableCell>
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
          {/* <DataGrid
            rows={products}
            columns={[
              { field: 'id', headerName: 'ID', width: 120 },
              { 
                field: 'storeName', 
                headerName: 'Store Name', 
                width: 200,
                valueGetter: (params) => params.row.stores.name
              },
              { 
                field: 'sourceName', 
                headerName: 'Source', 
                width: 160,
                valueGetter: (params) => params.row.sources.name
              },
              { field: 'site_name', headerName: 'Product Name', width: 180 },
            ]}
            pageSize={rowsPerPage}
            pagination
            rowCount={totalProducts}
            page={page - 1}
            onPageChange={handleNextPage}
            onPageSizeChange={handleChangeRowsPerPage}
            style={{ height: 700 }} // Set a fixed height (e.g., 400px)
          /> */}
          <button onClick={handleNextPage}>Next Page</button>
        </div>
      </PageContainer>
    </div>
  )
}

export default Download