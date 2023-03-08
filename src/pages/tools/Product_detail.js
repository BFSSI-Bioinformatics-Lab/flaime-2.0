import React, {useEffect, useState} from 'react'
import axios from 'axios';
import {useParams} from "react-router-dom"
import { Container } from '@mui/system';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const ItemTitle = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#D9965B',
    ...theme.typography.h5,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#f5f5f5',
  }));

const Product_detail = () => {
    

    const {productId} = useParams()
    // const thisProduct = productsData.find(prod => prod.id === productId)
    console.log(productId)
    const [products, setProducts] = useState([])
    const [isLoading, setLoading] = useState(true);
    // const [products, setProducts] = useState({
    //     isLoading: true,
    //     products:[]
    // });
    
    useEffect( () =>{
        
        setProducts(old=>({...old, isLoading: true}))
        
        let urlBase = `https://172.17.10.69:7251/api/StoreProductService/SelectStoreProductsAsync?id=${productId}`

        axios.get(urlBase).then(
            (res) => {
                console.log(res.data);
                console.log(res.data.responseObjects[0]);
                
                const dataProduct = res.data.responseObjects[0]
                if (dataProduct === undefined) return;
                setProducts(dataProduct)
                
                // setProducts(old=>({...old, isLoading: false, products: dataProduct}));
                setLoading(false)
            }      
        );
    },[productId]);

    // console.log(products.id)
    const product = products
    if (isLoading) {
        return <div className="App">Loading...</div>;
      }
    

  return (
    <div>
        {/* Top band */}
        
            <Box
                sx={{
                    display: 'flex',
                    // flexWrap: 'wrap',
                    alignItems: 'center',
                    flexGrow: 1,
                    width: 1,
                    height: 128,
                    backgroundColor: '#D9965B',
                    '& > :not(style)': {
                    m: 0,
                    width: '100%',
                    // height: 128,
                    backgroundColor: '#D9965B',
                    },
                }}
            >
                <Grid container spacing={1} direction="row"
                justifyContent="center" alignItems="center">
                    
                    <Grid container item xs={6} spacing={3}>
                        <Grid item xs={12} container={true}>
                            <ItemTitle elevation={0}>{product.siteName}</ItemTitle>
                        </Grid>
                    </Grid>

                    <Grid container item xs={6} spacing={3} direction="row"
                justifyContent="space-around" alignItems="center">
                        <Grid item xs={4}>
                            <Item >item1</Item>
                        </Grid>
                        <Grid item xs={4}>
                            <Item >item1</Item>
                        </Grid>
                        <Grid item xs={4}>
                            <Item >item1</Item>
                        </Grid> 
                    </Grid>
                </Grid>
                {/* <Paper elevation={0} width='50%' sx={{
                    display: "flex",
                    // justifyContent: "start",
                    alignItems: 'center',
                    overflow: 'hidden'    
                }}>
                    <Typography variant='h5' color='white'>
                        {products.products.siteName}
                    </Typography>
                </Paper> */}
                {/* <Paper></Paper> */}
                
            </Box>
        
        
        
        
        {/* Middle section with all info */}
        <div>
        <Grid container spacing={2} direction="row"
                justifyContent="flex-start" alignItems="center">
                <Grid item xs={12} md={7}>
                    <ItemTitle>{product.storeEntity.name}</ItemTitle>
                </Grid>

        </Grid>
            <Container>
                
                <div>
                    {/* {/* <p>Product name: {product.id}</p> */}
                    {/* <p>Store: {product.storeEntity.name}</p>
                    <p>Price:{product.price} {products.products.priceUnitEntity.name}</p>
                    <p>Description: {product.siteDescription}</p>
                    <p>Serving Size: {product.servingSize} {product.servingSizeUnitEntity.name}</p>  */}
                </div>
            </Container>
            
        </div>
    </div>
  )
}

export default Product_detail