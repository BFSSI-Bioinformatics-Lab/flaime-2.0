import React, { useState } from 'react'
import { SearchStoreProductsControlled, GetAllStoreProductsByPaginationControlled } from '../../../api/services/StoreProductService';
import { Link } from 'react-router-dom';
import MainTable from "../../../components/table/MainTable";
import PageContainer from '../../../components/page/PageContainer';
const Product_browser = () => {

  const [products, setProducts] = useState([]);
  const [cancelSearch, setCancelSearch] = useState(() => () => {});

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
        minWidth: 100,
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
    },
    { 
      field: 'source',
      headerName: "Web Scrape",
      minWidth: 150,
      flex: 2,
      renderCell: (params) => params.row.sourceEntity.name
    }
  ];

  const getAllProducts = async (pageSize, pageNumber) => {
    cancelSearch();
    try {
      const [GetAllStoreProductsByPagination, GetAllStoreProductsByPaginationCancel] = GetAllStoreProductsByPaginationControlled();
      setCancelSearch(() => () => GetAllStoreProductsByPaginationCancel());
      const data = await GetAllStoreProductsByPagination({ pageSize, pageNumber });
      setProducts(data.error ? [] : data.products)
      return data.pagination.totalRowCount;
    } catch (e) {
      if (e.code !== "ERR_CANCELED") {
        return 0;
      }
      return null;    
    }
  }

  const getSearchProducts = async (searchTerm, pageSize, pageNumber) => {
    cancelSearch();
    try {
      const [SearchStoreProductsCall, SearchStoreProductsCancel] = SearchStoreProductsControlled();
      setCancelSearch(() => () => SearchStoreProductsCancel());
      const data = await SearchStoreProductsCall({ searchTerm, pageSize, pageNumber });
      setProducts(data.error ? [] : data.products)
      return data.pagination.totalRowCount;
    } catch (e) {
      if (e.code !== "ERR_CANCELED") {
        return 0;
      }
      return null;    
    }
  }

  return (
    <div>
        {/* <h2>Product_browser Page</h2> */}
        <PageContainer>
          <h1>Table of all Products</h1>
          <MainTable columns={columns} rows={products} onPageChange={getAllProducts} onSearchChange={getSearchProducts}/>
        </PageContainer>
    </div>
  )
}

export default Product_browser