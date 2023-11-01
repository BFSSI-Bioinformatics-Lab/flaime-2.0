import React, {useEffect, useState} from 'react'
import { DataGrid, gridClasses } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField';
// import Product_detail from '../pages/tools/Product_detail';
import { styled } from '@mui/material';
import TableActionButtons from './TableActionButtons';
import StripedTable from './StripedTable';

const TempTable = ({
    columns, 
    rows, 
    loading, 
    setLoading = () => {},
    getRowHeight, 
    onPageChange, 
    onSearchChange, 
    totalRows,
    pageSize, 
    downloadMenu = true, 
    searchBar = true
}) => {
    
    const [pageState, setPageState] = useState({
        isLoading:false,
        products: [],
        total: 0,
        page:1,
        pageSize: pageSize ?? 25,
        search:""
    })

    const [columnVisibilities, setColumnVisibilities] = useState([]);

    const toggleColumnVisibility = (index) => {
        setColumnVisibilities(columnVisibilities.toSpliced(index, 1, 
            {
                ...columnVisibilities[index],
                visible: !(columnVisibilities[index].visible)
            } 
        ));
    }

    useEffect( () =>{
        const oldLoading = loading;
        setLoading(true);
        setPageState(old=>({...old, isLoading: true}))
        // let urlBase = `https://172.17.10.69:7251/api/StoreProductService/`
        
        /*let urlAllProducts =  `https://172.17.10.69:7251/api/StoreProductService/GetStoreProductsAsync?storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
        let urlSearch = `https://172.17.10.69:7251/api/StoreProductService/SearchStoreProductsAsync?searchterm=${pageState.search}&storeid=-1&pageSize=${pageState.pageSize}&scrapebatchid=-1&mostrecentonly=true&pageNumber=${pageState.page}`
        
        let urlMain = urlAllProducts

        if (pageState.search !== "") {
            urlMain = urlSearch 
          }
        */
        const action = pageState.search === "" ? 
            () => onPageChange(pageState.pageSize, pageState.page) : 
            () => onSearchChange(pageState.search, pageState.pageSize, pageState.page);
       
        action().then(
            /*(res) => {
                //console.log(res.data);
                console.log(res.data.responseObjects);
                setPageState(old=>({...old, isLoading: false, products: res.data.responseObjects, total: res.data.pagination.totalRowCount}))
                // setProducts(res.data.responseObjects);
            }*/
            (res) => setPageState(old=>({...old, isLoading: false, total: res}))
        )
        .catch(() => setPageState(old=>({...old, isLoading: false, total: 0})))
        .finally(() => setLoading(oldLoading));
        
    },[pageState.page, pageState.pageSize, pageState.search]);

    useEffect(() => {
        setPageState(old => ({...old, page: 1, total: totalRows ?? old.total}))
    }, [totalRows])

    useEffect(() => {
        setPageState(old => ({...old, pageSize: pageSize ?? old.pageSize}))
    }, [pageSize])

    useEffect(() => {
        setColumnVisibilities(columns.map((column) => ({ headerName: column.headerName, field: column.field, visible: true })));
    }, []);


    const requestSearch = (event) => {
        setPageState(old=>({
            ...old,
            search: event.target.value,
            page:1
        }));


    };

  return (
    <div >
            {/* <p>{products.productName}</p>
            <p>{products.productUpc}</p> */}
            {/* <DataGrid 
                rows={products}
                columns={columns}
            /> */}
            {
                downloadMenu && 
                <div style={{ marginBottom: 20 }}>
                    <TableActionButtons columns={columnVisibilities} onColumnClick={toggleColumnVisibility}/>
                </div>
            }
            { 
                searchBar && 
                <TextField
                name="search"
                value={pageState.search}
                onChange={(searchVal) => requestSearch(searchVal)}
                variant="outlined"
                label="Search"
                sx={{pb: "15px"}}
                // onCancelSearch={() => cancelSearch()}
                />
            }
            <StripedTable
                rows={rows}
                rowCount={pageState.total}
                loading={pageState.isLoading || loading}
                rowsPerPageOptions={[25,50,100]}
                pagination
                page={pageState.page - 1}   //page currently visable
                pageSize={pageState.pageSize}   //# of rows visible in page
                onPageChange={(newPage) => setPageState(old =>({...old, page:newPage + 1}))}
                onPageSizeChange={(newPageSize) => setPageState(old=>({...old, pageSize: newPageSize}))}
                columns={columns}
                getRowClassName={(params) => 
                    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                }   
                disableSelectionOnClick 
                controlledColumns={true}
                columnVisibilityModel={
                    columnVisibilities.reduce((obj, col) => (
                        { ...obj, [col.field]: col.visible }
                    ), {})
                }
                // components={{
                //     Toolbar: GridToolbar,
                // }}
            />
    </div>
  )
}

export default TempTable