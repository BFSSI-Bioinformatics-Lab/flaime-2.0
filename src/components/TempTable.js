import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid'

const columns = [
    // { field: 'id', headerName: 'ID' },
    { field: 'productName', headerName: 'Product', width: 100 },
    { field: 'productStore', headerName: 'Store', width: 100 },
    { field: 'productPrice', headerName: 'Price' },
    { field: 'productUpc', headerName: 'UPC', width: 100 },
    { field: 'productCategory', headerName: 'Category', width: 100 }
];

const TempTable = () => {
    const [products, setProducts] = useState([]);

    

    useEffect( () =>{
        axios.get("https://172.17.10.69:7251/api/Products1/").then(
            (res) => {
                console.log(res.data);
                setProducts(res.data);
            }
        );
    },[]);

  return (
    <div style={{ height: 500, width: '50%' }}>
        <h2>Table of all Products</h2>
        {/* <p>{products.productName}</p>
        <p>{products.productUpc}</p> */}
        <DataGrid 
            rows={products}
            columns={columns}
            pageSize={10}
        />
    </div>
  )
}

export default TempTable