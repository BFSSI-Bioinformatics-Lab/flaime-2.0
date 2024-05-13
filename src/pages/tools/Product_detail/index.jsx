import React, {useEffect, useState} from 'react'
import {useParams} from "react-router-dom"
import { ApiQueryGet } from '../../../api/Api';
import { Image } from 'mui-image'
import Grid from '@mui/material/Grid';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import {
    ProductInfoBox,
    ProductStatItem,
    PageIcon,
    PageTitle,
    DetailItem,
    ProductImageContainer,
    ProductIngredientsHeadingContainer
} from "./styles";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

import { nft_order, nutrientMatches } from './nft_flaime_nutrients';

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
        return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
    }

    const breadcrumbComponent = (crumbs) => {
        return crumbs.join(" > ")
    }

    // list of possible energy values
    const energy = ['ENERGY (KILOCALORIES)', 'ENERGY (KILOJOULES)'];




    useEffect( () =>{
        
        setProducts(old=>({...old, isLoading: true}))
        
        let urlBase = `StoreProductService/SelectStoreProductsAsync?id=${productId}`

        ApiQueryGet(urlBase).then(
            (data) => {
                const dataProduct = data.responseObjects[0]
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
            // {
            //     name: "Total Size",
            //     value: product.totalSize
            // },
            // {
            //     name: "Serving Size",
            //     value: product.servingSize ? `${product.servingSize} ${product.servingSizeUnitEntity.name ?? ""}` : null
            // },
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
                    {/*Change to md={6} when uncomment the lower part */}
                     <Grid xs={12} md={12} item> 
                        <Grid container alignItems="center" wrap="nowrap">
                            <Grid item>
                                <PageIcon></PageIcon>
                            </Grid>
                            <Grid item>
                                <PageTitle elevation={0}>{product.siteName}</PageTitle>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* <Grid container item xs={12} md={6} spacing={3} direction="row"
                justifyContent="space-around" alignItems="center">
                        <Grid item xs={3}>
                            <ProductStatItem >High Sodium</ProductStatItem>
                        </Grid>
                        <Grid item xs={3}>
                            <ProductStatItem >Low Fat</ProductStatItem>
                        </Grid>
                        <Grid item xs={3}>
                            <ProductStatItem >No Sugar</ProductStatItem>
                        </Grid> 
                        <Grid item xs={1}>
                            
                        </Grid>
                    </Grid> */}
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
                <ProductInfoBox>
                    {product &&
                        <Grid container columnSpacing={6} direction="row"
                            justifyContent="space-between" alignItems="flex-start">
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
                                        <ProductImageContainer style={{ display: 'flex', justifyContent: 'center' }}>
                                            <Image key={product.storeProductImageEntities[0].imagePath} 
                                                src={imagePathToUrl(product.storeProductImageEntities[0].imagePath)} 
                                                alt={product.siteName} 
                                                width="50%"
                                            />
                                        </ProductImageContainer>
                                    )}
                                    <Grid container
                                        // direction="row-reverse"
                                        // columnSpacing={12}
                                        justifyContent={"center"}
                                    >
                                        
                                        <>
                                            <Grid item xs={8}><Grid container direction="column-reverse" rowSpacing={2}>
                                            <TableContainer component={Paper}>
                                                <Typography variant="h6" style={{ padding: '10px' }}>Nutrition Facts</Typography>
                                                <Typography variant="body2" style={{ padding: '10px' }}>
                                                    Serving Size:  {product.servingSize ? 
                                                    `${product.servingSize} ${product.servingSizeUnitEntity.name ?? ""}` : 
                                                    (product.rawServingSize ? `${product.rawServingSize}` : null)}
                                                    <br></br>
                                                    Total size: {product.totalSize}
                                                </Typography>
                                                <Divider variant="middle"/>
                                                <Typography variant="body2" style={{ padding: '10px' }}>{product.storeProductNutritionFactEntities
                                                    .filter((nutritionFact) => energy.includes(nutritionFact.nutrientEntity.name))
                                                    .map((nutritionFact) => (
                                                        `Calories : ${nutritionFact.amount} ${nutritionFact.amountUnitEntity.name}`
                                                    ))}</Typography>
                                                <Table size="small" aria-label="a dense table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell style={{ padding: '0px' }}></TableCell>
                                                            <TableCell style={{ padding: '0px' }}></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    {/* <TableBody>
                                                        {product.storeProductNutritionFactEntities
                                                            .filter((nutritionFact) => nutritionFact.amount !== null && !energy.includes(nutritionFact.nutrientEntity.name))
                                                            .map((nutritionFact) => (
                                                                <React.Fragment key={nutritionFact.id}>
                                                                    <TableRow>
                                                                        <TableCell>
                                                                            <span style={{ textTransform: 'capitalize', fontSize: 'smaller' }}>{nutritionFact.nutrientEntity.name.toLowerCase()}</span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {nutritionFact.amount} {nutritionFact.amountUnitEntity.name}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            ))}
                                                    </TableBody> */}
                                                    <TableBody>
                                                        {product.storeProductNutritionFactEntities
                                                            .filter((nutritionFact) => nutritionFact.amount !== null && !energy.includes(nutritionFact.nutrientEntity.name))
                                                            .map((nutritionFact) => {
                                                                const localizedKey = Object.keys(nutrientMatches).find(key => nutrientMatches[key].includes(nutritionFact.nutrientEntity.name)) || nutritionFact.nutrientEntity.name;

                                                                return { nutritionFact, localizedKey };
                                                            })
                                                            .sort((a, b) => {
                                                                const aLocalizedKey = a.localizedKey;
                                                                const bLocalizedKey = b.localizedKey;
                                                                const aOrder = nft_order[aLocalizedKey] || 9999; // Default to a large number if key not found
                                                                const bOrder = nft_order[bLocalizedKey] || 9999; // Default to a large number if key not found

                                                                return aOrder - bOrder;
                                                            })
                                                            .map(({ nutritionFact, localizedKey }) => (
                                                                <React.Fragment key={nutritionFact.id}>
                                                                    <TableRow>
                                                                        <TableCell>
                                                                            <span style={{ textTransform: 'capitalize', fontSize: 'smaller' }}>
                                                                                {localizedKey}
                                                                                {/* Display the localized key */}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {nutritionFact.amount} {nutritionFact.amountUnitEntity.name}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            </Grid></Grid>
                                            
                                        </>
                                        
                                    </Grid>
                                    { product.ingredientEn && 
                                        <div>
                                            <ProductIngredientsHeadingContainer>
                                            {/* <Typography variant="h6" style={{ padding: '10px' }}><b>Ingredients:</b></Typography> */}
                                            <Divider> Ingredients</Divider>
                                            </ProductIngredientsHeadingContainer>
                                            {/* <Divider variant="middle"/> */}
                                            
                                            <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>{product.ingredientEn.toLowerCase()}</Typography>
                                            
                                        </div>
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    }
                </ProductInfoBox>
            </PageContainer>
            <Band>
                <PageTitle>Visualizations</PageTitle>
            </Band>
            
        </div>
    </div>
  )
}

export default Product_detail