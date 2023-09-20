import React, {useEffect, useState} from 'react'
import {useParams} from "react-router-dom"
import ApiInstance from '../../api/Api';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { Image } from 'mui-image'
import Grid from '@mui/material/Grid';
import PageContainer from '../../components/page/PageContainer';
import Band from '../../components/page/Band';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#fff',
    ...theme.typography.body1,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    boxShadow: "none"
  }));

const ItemIcon = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.landing.main,
    padding: theme.spacing(1),
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: 0,
    marginRight: theme.spacing(2)
}));

const ItemTitle = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#D9965B',
    ...theme.typography.h4,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#f5f5f5',
    boxShadow: "none"
}));

const DetailItem = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#fff',
    ...theme.typography.body1,
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'start',
    color: '#191919'
}));

const Product_detail = () => {
    

    const {productId} = useParams()
    // const thisProduct = productsData.find(prod => prod.id === productId)
    console.log(productId)
    const [products, setProducts] = useState([])
    const [isLoading, setLoading] = useState(true);
    const [productDescItems, setProductDescItems] = useState([]);
    // const [products, setProducts] = useState({
    //     isLoading: true,
    //     products:[]
    // });

    const [product, setProduct] = useState()

    const imagePathToUrl = (imagePath) => {
        // TODO: use the real location of the image
        return `http://172.17.10.134/media/${imagePath}`;
    }

    const breadcrumbComponent = (crumbs) => {
        return crumbs.join(" > ")
    }

    useEffect( () =>{
        
        setProducts(old=>({...old, isLoading: true}))
        
        let urlBase = `StoreProductService/SelectStoreProductsAsync?id=${productId}`

        ApiInstance.get(urlBase).then(
            (res) => {
                const dataProduct = res.data.responseObjects[0]
                if (dataProduct === undefined) return;
                setProducts(dataProduct);
                setProduct(dataProduct);
                // setProducts(old=>({...old, isLoading: false, products: dataProduct}));
                setLoading(false)
            }      
        );
    },[productId]);

    useEffect(() => {
        if (!product) return;
        const items = [
            {
                name: "Product Name",
                value: product.productEntity.nameOfProduct
            },
            {
                name: "Brand",
                value: product.productEntity.brandEntity.hasName ?
                    product.productEntity.brandEntity.name : null 
            },
            {
                name: "Store",
                value: products.storeEntity.name
            },
            {
                name: "Product Code",
                value: product.storeProductCode
            },
            {
                name: "UPC",
                value: product.rawUpc || "None"
            },
            {
                name: "Price",
                value: product.price ? `${product.price} ${product.priceUnitEntity.name ?? ""}` : null
            },
            {
                name: "Description",
                value: products.siteDescription
            },
            {
                name: "Category", // does the category need to be verified in order to be displayed?
                value: product.subcategoryPredictionEntity.verified ? 
                    product.subcategoryPredictionEntity.predictedCategoryName : null
            },
            {
                name: "Subcategory", // does the category need to be verified in order to be displayed?
                value: product.categoryPredictionEntity.verified ? 
                    product.categoryPredictionEntity.predictedSubcategoryName : null
            },
            {
                name: "Variety Pack",
                value: product.productEntity.varietyPackFlag ? "True" : "False"
            },
            {
                name: "Atwater Result",
                value: product.productEntity.atWaterResult ?? "Missing information"
            },
            {
                name: "Total Size",
                value: product.totalSize
            },
            {
                name: "Serving Size",
                value: product.servingSize ? `${product.servingSize} ${product.servingSizeUnitEntity.name ?? ""}` : null
            },
            {
                name: "Breadcrumbs",
                value: breadcrumbComponent(product.breadcrumbEntity.breadcrumbArray)
            },
            {
                name: "URL",
                value: product.siteUrl ? <a href={product.siteUrl}>{product.siteName}</a> : null
            }
        ];
        setProductDescItems(items);
    }, [product]);
    

    // console.log(products.id)
    if (isLoading) {
        return <div className="App">Loading...</div>;
      }
    

  return (
    <div>
        {/* Top band */}
        
            <Band
            >
                <Grid container spacing={1} direction="row"
                justifyContent="space-between" alignItems="center">
                    <Grid xs={12} md={6} item>
                        <Grid container alignItems="center" wrap="nowrap">
                            <Grid item>
                                <ItemIcon></ItemIcon>
                            </Grid>
                            <Grid item>
                                <ItemTitle elevation={0}>{product.siteName}</ItemTitle>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} md={6} spacing={3} direction="row"
                justifyContent="space-around" alignItems="center">
                        <Grid item xs={3}>
                            <Item >High Sodium</Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item >Low Fat</Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item >No Sugar</Item>
                        </Grid> 
                        <Grid item xs={1}>
                            
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
                
            </Band>
        
        
        
        
        {/* Middle section with all info */}
        <div>
            <PageContainer >
                <Box sx={{ padding: "40px 0" }}>
                    {product &&
                        <Grid container columnSpacing={6} direction="row"
                            justifyContent="space-between" alignItems="flex-start">
                            {/*<Grid item xs={12} md={7} >
                                <DetailItem elevation={0}>Store:{product.storeEntity.name}</DetailItem>
                                <Divider></Divider>
                                <DetailItem elevation={0}>Price:{product.price} {product.priceUnitEntity.name}</DetailItem>
                                <Divider/>
                                <DetailItem elevation={0}>Description: {product.siteDescription}</DetailItem>
                                <Divider/>
                    </Grid>*/}
                            <Grid item xs={12} md={6}>
                                <div>
                                    {productDescItems && productDescItems.map((item) => ( item.value && 
                                        <>
                                            <DetailItem key={item.name} elevation={0}>{item.name}: {item.value}</DetailItem>
                                        </>
                                    ))}
                                </div>
                                <Grid container 
                                    direction="row"
                                >
                                    {product.storeProductImageEntities.length > 1 && product.storeProductImageEntities.slice(1).map(imageEntity => (
                                        <Grid key={imageEntity.id} item sm={12} md={6} 
                                            lg={Math.max(Math.floor(12 / (product.storeProductImageEntities.length - 1)), 4)}
                                        >
                                            <Image key={imageEntity.imagePath} 
                                                src={imagePathToUrl(imageEntity.imagePath)} 
                                                alt={product.siteName}  
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <div>
                                    {product.storeProductImageEntities && product.storeProductImageEntities.length > 0 && (
                                        <div style={{ margin: "50px 0" }}>
                                            <Image key={product.storeProductImageEntities[0].imagePath} 
                                                src={imagePathToUrl(product.storeProductImageEntities[0].imagePath)} 
                                                alt={product.siteName} 
                                                width="100%"
                                            />
                                        </div>
                                    )}
                                    <Grid container
                                        direction="row-reverse"
                                        columnSpacing={12}
                                        justifyContent={"center"}
                                    >
                                        {product.storeProductNutritionFactEntities && 
                                            <>
                                                <Grid item xs={4}><Grid container direction="column-reverse" rowSpacing={2}>
                                                { product.storeProductNutritionFactEntities.slice(0, 
                                                    Math.floor(product.storeProductNutritionFactEntities.length / 2)).map(
                                                        (nutritionFact) => ( nutritionFact.amount !== null &&
                                                            <Grid xs={12} item >
                                                                <Grid container 
                                                                    justifyContent={"space-between"} 
                                                                    alignItems={"flex-end"}
                                                                    columnSpacing={1}
                                                                >
                                                                    <Grid item sm={6} textAlign={"left"}>
                                                                        <div>
                                                                            <b>{nutritionFact.nutrientEntity.symbol}</b>
                                                                        </div>
                                                                    </Grid>
                                                                    <Grid item sm={6} textAlign={"right"}>
                                                                        <div>{nutritionFact.amount}{nutritionFact.amountUnitEntity.name}</div>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                ))}
                                                </Grid></Grid>
                                                <Grid item xs={4}><Grid container direction="column-reverse" rowSpacing={2}>
                                                { product.storeProductNutritionFactEntities.slice(
                                                    Math.floor(product.storeProductNutritionFactEntities.length / 2)).map(
                                                        (nutritionFact) => ( nutritionFact.amount !== null &&
                                                            <Grid xs={12} item >
                                                                <Grid container 
                                                                    justifyContent={"space-between"} 
                                                                    alignItems={"flex-end"}
                                                                    columnSpacing={1}
                                                                >
                                                                    <Grid item sm={6} textAlign={"left"}>
                                                                        <div>
                                                                            <b>{nutritionFact.nutrientEntity.symbol}</b>
                                                                        </div>
                                                                    </Grid>
                                                                    <Grid item sm={6} textAlign={"right"}>
                                                                        <div>{nutritionFact.amount}{nutritionFact.amountUnitEntity.name}</div>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                ))}
                                                </Grid></Grid>
                                            </>
                                        }
                                    </Grid>
                                    { product.ingredientEn && 
                                        <div>
                                            <div style={{ marginTop: "40px", marginBottom: "10px"}}>
                                                <b>INGREDIENTS</b>
                                            </div>
                                            <div>
                                                {product.ingredientEn.toUpperCase()}
                                            </div>
                                        </div>
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    }
                </Box>
            </PageContainer>
            {/*<Container>
                
                <div>
                    <p>Product name: {product.id}</p>
                    <p>Store: {product.storeEntity.name}</p>
                    <p>Price:{product.price} {product.priceUnitEntity.name}</p>
                    <p>Description: {product.siteDescription}</p>
                    <p>Serving Size: {product.servingSize} {product.servingSizeUnitEntity.name}</p> 
                </div>
                        </Container>*/}
            <Band>
                <ItemTitle>Visualizations</ItemTitle>
            </Band>
            
        </div>
    </div>
  )
}

export default Product_detail