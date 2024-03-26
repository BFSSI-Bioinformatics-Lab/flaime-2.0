// https://dev.to/stephanieopala/server-side-pagination-in-react-js-material-ui-3bk
// Not being used anywhere, we are currently using TempTable
import { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableContainer
} from '@mui/material';

import axios from 'axios';
import TextField from '@mui/material/TextField';
import { OpenInNew, PageviewOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
// import './Table.css';

const StyledHeader = styled(TableCell)(({ theme }) => ({
  typography: 'subtitle',
  fontWeight: 'bold',
  fontSize: 16,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: 14,
}));

const ProductTable = () => {
  const [productList, setProductList] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [controller, setController] = useState({
    page: 0,
    rowsPerPage: 10,
    search: null
  });

  useEffect(() => {
    const getData = async () => {
      let page_n = controller.page + 1
      // Currently set up for the django API, will need to be changed.
      // let url = `http://127.0.0.1:7166/api/recent_products_react/?page=${page_n}&size=${controller.rowsPerPage}`
      let url = `http://127.0.0.1:7166/api/recent_products_react/?page=${page_n}&size=${controller.rowsPerPage}`
      console.log(controller.search);
      //https://172.17.10.69:7251/api/StoreProductService/GetStoreProductsAsync?storeid=13&scrapebatchid=-1&mostrecentonly=true&pageNumber=${page_n}&pageSize=${controller.rowsPerPage}
      if (controller.search != null) {
        url = url + `&search=${controller.search}`
      }
        console.log("making api call");   alert("making API call");
        console.log(controller.page);
        console.log(url);

        axios.get(url, {}, {
          //does not work
          // auth: {
          //   username: 'admin',
          //   password: 'abc'
          // }
        }).then(response => {
               alert("TEST: response=" + response);
               alert("TEST: response.data=" + response.data);
               alert("TEST: response.data.results=" + response.data.results);
          setProductList(response.data.results);
          setProductCount(response.data.count);
          console.log(response.data.results);

        }, error => {
          console.log(error);
        });      
     };
    getData();
  }, [controller]);


  const requestSearch = (event) => {
    setController({
      ...controller,
      search: event.target.value,
      page: 0
    });


  };

  const handlePageChange = (event, newPage) => {
    console.log("handlePageChange");
    setController({
      ...controller,
      page: newPage
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setController({
      ...controller,
      rowsPerPage: parseInt(event.target.value, 10),
      //page: 0
    });
  };

  return (
    <TableContainer sx={{padding: "15px"}}>
        <TextField
          name="search"
          value={controller.search}
          onChange={(searchVal) => requestSearch(searchVal)}
          variant="outlined"
          label="Search"
          sx={{pb: "15px"}}
          // onCancelSearch={() => cancelSearch()}
        />
      <Table size="small" sx={{borderRadius: "3pt", boxShadow: "0 0 0 1pt grey", width: "98%"}}>
        <TableHead>
          <TableRow>
            <StyledHeader>
              Page
            </StyledHeader>
            <StyledHeader>
              Name
            </StyledHeader>
            <StyledHeader>
              Brand
            </StyledHeader>
            <StyledHeader>
              Store
            </StyledHeader>
            <StyledHeader>
              Category
            </StyledHeader>
            <StyledHeader>
              Sub-Category
            </StyledHeader>
            <StyledHeader>
              Product Code
            </StyledHeader>
            <StyledHeader>
              External URL
            </StyledHeader>

          </TableRow>
        </TableHead>
        <TableBody>
          {productList.map((product) => (
            <TableRow key={product.id} hover role="checkbox">
              <TableCell> <div> TEST-TEST-TEST </div>
                {/* This needs to be changed from a-href to a Link, and we also need a Router set up for it */}
              <a href={`http://127.0.0.1:7166/tools/product_browser/${product.id}`} className="url_no_highlight"><PageviewOutlined/></a>
              </TableCell>

              <TableCell>
                {product.name}
              </TableCell>
              <TableCell>
                {product.brand}
              </TableCell>
              <TableCell>
                {product.store}
              </TableCell>
              <TableCell>
                {product.category.calculated_best_category}
              </TableCell>
              <TableCell>
                {product.subcategory.calculated_best_subcategory}
              </TableCell>
              <TableCell>
                {product.product_code}
              </TableCell>
              <TableCell>
                <a href={product.url} className="url_no_highlight"><OpenInNew/></a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        onPageChange={handlePageChange}
        page={controller.page}
        count={productCount}
        rowsPerPage={controller.rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{width: "98%"}}
      />
    </TableContainer>
  )
}

export default ProductTable;
