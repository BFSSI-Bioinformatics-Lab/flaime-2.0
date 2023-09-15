import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField';
import {Link} from "react-router-dom"
// import Product_detail from '../pages/tools/Product_detail';
import { Container } from '@mui/system';
import { styled } from '@mui/material';

const columns = [
    // { field: 'id', headerName: 'ID' },
    // { field: 'productName', headerName: 'Product', width: 100 },
    // { field: 'productStore', headerName: 'Store', width: 100 },
    // { field: 'productPrice', headerName: 'Price' },
    // { field: 'productUpc', headerName: 'UPC', width: 100 },
    // { field: 'productCategory', headerName: 'Category', width: 100 }
    { 
        field: 'id', 
        headerName: 'Id', 
        flex: 1,
        minWidth: 100,
        renderCell: (params) => 
        // <a href={`https://172.17.10.69:7251/api/StoreProductService/SelectStoreProductsAsync?id=${params.row.id}`}>{params.row.id}</a>,
        <Link to={`${params.row.id}`}>{params.row.id}</Link>,
            //`https://172.17.10.69:7251/api/StoreProductService/SelectStoreProductsAsync?id=${params.row.id}` 
    },
    { 
        field: 'siteName', 
        headerName: 'Store Name', 
        minWidth: 200,
        flex: 5 
    },
    { 
        field: 'rawBrand', 
        headerName: 'Brand', 
        minWidth: 150,
        flex: 2 
    },
    { 
        field: 'store', 
        headerName: "Store",
        minWidth: 150,
        flex: 2,
        renderCell: (params) => params.row.storeEntity.name
    },
    {
        field: "categoryPredictionEntityId",
        headerName: "Category",
        minWidth: 200,
        flex: 3,
        renderCell: (params) => params.row.productEntity.categoryEntity ? params.row.productEntity.categoryEntity.name : null
    },
    { 
        field: 'storeProductCode', 
        headerName: 'Code', 
        minWidth: 50,
        flex: 2 
    },
    { 
        field: 'siteUrl', 
        headerName: 'External Url', 
        minWidth: 150,
        flex: 2,
        renderCell: (params) => <a href={`${params.row.siteUrl}`}>{params.row.storeEntity.name}</a>
    }
];

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    fontSize: theme.typography.fontSize * 1.5,
    [`& .${gridClasses.row}.odd`]: {
        backgroundColor: "white",
        "&:hover, &.Mui-hovered": {
            backgroundColor: theme.palette.grey[400]
        }
    },
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: theme.palette.grey[100],
        "&:hover, &.Mui-hovered": {
            backgroundColor: theme.palette.grey[400]
        }
    },
    [`.${gridClasses.columnHeaderTitle}`]: {
        fontWeight: "bold",
        fontSize: theme.typography.fontSize * 1.8,
        padding: theme.spacing(3)
    },
    [`& .${gridClasses.cell}`]: {
        padding: theme.spacing(4)
    }
}));

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
        
        let urlAllProducts =  `https://172.17.10.69:7251/api/StoreProductService/GetStoreProductsAsync?storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
        let urlSearch = `https://172.17.10.69:7251/api/StoreProductService/SearchStoreProductsAsync?searchterm=${pageState.search}&storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
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
    <div >
        <Container maxWidth="false">
            <h1>Table of all Products</h1>
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
            <StripedDataGrid
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
                getRowClassName={(params) => 
                    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                }   
                disableSelectionOnClick 
                // components={{
                //     Toolbar: GridToolbar,
                // }}
            />
        </Container>
    </div>
  )
}

export default TempTable