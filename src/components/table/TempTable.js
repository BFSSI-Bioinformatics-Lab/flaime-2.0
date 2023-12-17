import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField';
import {Link} from "react-router-dom"
// import Product_detail from '../pages/tools/Product_detail';
import { Container } from '@mui/system';


const columns = [
    // { field: 'id', headerName: 'ID' },
    // { field: 'productName', headerName: 'Product', width: 100 },
    // { field: 'productStore', headerName: 'Store', width: 100 },
    // { field: 'productPrice', headerName: 'Price' },
    // { field: 'productUpc', headerName: 'UPC', width: 100 },
    // { field: 'productCategory', headerName: 'Category', width: 100 }
    { field: 'siteName', headerName: 'Store Name', width: 250 },
    { 
        field: 'id', 
        headerName: 'Id', 
        width: 100, 
        renderCell: (params) => 
        // <a href={`https://172.17.10.69:7251/api/StoreProductService/SelectStoreProductsAsync?id=${params.row.id}`}>{params.row.id}</a>,
        <Link to={`${params.row.id}`}>{params.row.id}</Link>,
            //`https://172.17.10.69:7251/api/StoreProductService/SelectStoreProductsAsync?id=${params.row.id}` 
    },
    { field: 'rawBrand', headerName: 'Brand' },
    { field: 'rawServingSize', headerName: 'Serving Size' },
    { field: 'readingPrice', headerName: 'Price' },
    { field: 'storeProductCode', headerName: 'Code' },
    { field: 'storeEntityId', headerName: 'store' }
];

const TempTable = () => {
    // const [products, setProducts] = useState([]);
    const [pageState, setPageState] = useState({
        isLoading:false,
        products: [],
        total: 0,
        page:1,
        pageSize:25,
        search:""
    })

    

    useEffect( () =>{
        setPageState(old=>({...old, isLoading: true}))
        // let urlBase = `https://172.17.10.69:7251/api/StoreProductService/`
        
        let urlAllProducts =  `https://localhost:7166/api/StoreProductService/GetStoreProductsAsync?storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
        let urlSearch = `https://localhost:7166/api/StoreProductService/SearchStoreProductsAsync?searchterm=${pageState.search}&storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
        let urlMain = urlAllProducts

        if (pageState.search !== "") {
            urlMain = urlSearch 
          }
        
        axios.get(urlMain).then(
            (res) => {
                console.log(res.data);
                console.log(res.data.responseObjects);
                setPageState(old=>({...old, isLoading: false, products: res.data.responseObjects, total: res.data.pagination.totalRowCount}))
                // setProducts(res.data.responseObjects);
            }
        );
    },[pageState.page, pageState.pageSize, pageState.search]);

    const requestSearch = (event) => {
        setPageState(old=>({
            ...old,
            search: event.target.value,
            page:1
        }));


    };

  return (
    <div style={{ height: 500, width: '70%' }}>
        <Container>
            <h2>Table of all Products</h2>
            {/* <p>{products.productName}</p>
            <p>{products.productUpc}</p> */}
            {/* <DataGrid 
                rows={products}
                columns={columns}
            /> */}
            <TextField
            name="search"
            value={pageState.search}
            onChange={(searchVal) => requestSearch(searchVal)}
            variant="outlined"
            label="Search"
            sx={{pb: "15px"}}
            // onCancelSearch={() => cancelSearch()}
            />
            <DataGrid
                autoHeight
                rows={pageState.products}
                rowCount={pageState.total}
                loading={pageState.isLoading}
                rowsPerPageOptions={[25,50,100]}
                pagination
                page={pageState.page - 1}   //page currently visable
                pageSize={pageState.pageSize}   //# of rows visible in page
                paginationMode="server"
                onPageChange={(newPage) => setPageState(old =>({...old, page:newPage + 1}))}
                onPageSizeChange={(newPageSize) => setPageState(old=>({...old, pageSize: newPageSize}))}
                columns={columns}
                // components={{
                //     Toolbar: GridToolbar,
                // }}
            />
        </Container>
    </div>
  )
}

export default TempTable