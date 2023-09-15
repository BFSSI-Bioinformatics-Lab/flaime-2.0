import React, { useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import TempTable from "../../components/TempTable";
import { Container } from '@mui/material';
const Product_browser = () => {

  const [products, setProducts] = useState([]);

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
        <Link to={`${params.row.id}`}>{params.row.id}</Link>,
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

  const getAllProducts = async (pageSize, pageNumber) => {
    const urlProducts =  `https://172.17.10.69:7251/api/StoreProductService/GetStoreProductsAsync?storeid=-1&pageSize=${pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageNumber}`;
    const res = await axios.get(urlProducts);
    setProducts(res.data.responseObjects)
    return res.data.pagination.totalRowCount;
  }

  const getSearchProducts = async (search, pageSize, pageNumber) => {
    const urlSearch = `https://172.17.10.69:7251/api/StoreProductService/SearchStoreProductsAsync?searchterm=${search}&storeid=-1&pageSize=${pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageNumber}`
    const res = await axios.get(urlSearch);
    setProducts(res.data.responseObjects)
    return res.data.pagination.totalRowCount;
  }

  return (
    <div>
        {/* <h2>Product_browser Page</h2> */}
        <Container maxWidth="false">
          <h1>Table of all Products</h1>
          <TempTable columns={columns} rows={products} onPageChange={getAllProducts} onSearchChage={getSearchProducts}/>
        </Container>
    </div>
  )
}

export default Product_browser