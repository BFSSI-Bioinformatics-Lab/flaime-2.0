import React, { useState } from 'react'
import { SearchStoreProducts, GetAllStoreProductsByPagination } from '../../api/StoreProductService';
import { Link } from 'react-router-dom';
import TempTable from "../../components/table/TempTable";
import PageContainer from '../../components/page/PageContainer';
import ApiInstance from '../../api/Api';
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
        minWidth: 130,
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
        minWidth: 350,
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
        minWidth: 230,
        flex: 2,
        renderCell: (params) => <a href={`${params.row.siteUrl}`}>{params.row.storeEntity.name}</a>
    }
  ];

  const getAllProducts = async (pageSize, pageNumber) => {
    const data = await GetAllStoreProductsByPagination({ pageSize, pageNumber });
    setProducts(data.error ? [] : data.products)
    return data.pagination.totalRowCount;
  }

  const getSearchProducts = async (searchTerm, pageSize, pageNumber) => {
    const data = await SearchStoreProducts({ searchTerm, pageSize, pageNumber });
    setProducts(data.error ? [] : data.products)
    return data.pagination.totalRowCount;
  }

  return (
    <div>
        {/* <h2>Product_browser Page</h2> */}
        <PageContainer>
          <h1>Table of all Products</h1>
          <TempTable columns={columns} rows={products} onPageChange={getAllProducts} onSearchChange={getSearchProducts}/>
        </PageContainer>
    </div>
  )
}

export default Product_browser