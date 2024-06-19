import React, {useEffect, useState} from 'react'
import {useParams} from "react-router-dom"

import Grid from '@mui/material/Grid';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import {
    ProductInfoBox,
    PageIcon,
    PageTitle,
    DetailItem,
    ProductImageContainer,
    ProductIngredientsHeadingContainer
} from "./styles";
import { Paper, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { Dialog, DialogContent, DialogTitle, Box  } from '@mui/material';
import axios from 'axios';
import NutritionFactsTable from '../../../components/nutrition_facts_table/NutritionFactsTable';


const Product_detail = () => {
    const {productId} = useParams()
    console.log(productId)
    const [isLoading, setLoading] = useState(true);
    const [productDescItems, setProductDescItems] = useState([]);
    const [product, setProduct] = useState()

    const imagePathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
    }

    const breadcrumbComponent = (crumbs) => {
        return crumbs.join(" > ")
    }

    // list of possible energy values
    const energy = ['ENERGY (KILOCALORIES)', 'ENERGY (KILOJOULES)'];

    // States for image modal
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // List of images handle of dialog opening
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imageEntity) => {
      setSelectedImage(imageEntity);
    };
  
    const handleCloseDialog = () => {
      setSelectedImage(null);
    };


    useEffect( () =>{        
        let elasticUrl = `${process.env.REACT_APP_ELASTIC_URL}/_doc`;
        const elasticImgUrl = `${process.env.REACT_APP_ELASTIC_IMG_URL}/_doc`;

        axios.all([
          axios.get(`${elasticUrl}/${productId}`),
          axios.get(`${elasticImgUrl}/${productId}`),
      ]).then(
          axios.spread((data, imgData) => {
              const dataProduct = data.data._source;
              if (dataProduct === undefined) return;
              const imgPaths = imgData.data._source.store_product_images;
              setProduct({ ...dataProduct, store_product_images: imgPaths });
              setLoading(false);
              console.log(imgPaths)
          })
      );
    },[productId]);
    console.log(product)

    useEffect(() => {
        if (!product) return;
        const items = [
            {
                name: "Product Name",
                value: product.site_name
            },
            {
                name: "Brand",
                value: product.raw_brand ? product.raw_brand : null 
            },
            {
                name: "Store",
                value: product.stores.name
            },
            {
                name: "Source",
                value: product.sources.name
            },
            {
                name: "Product Code",
                value: product.store_product_code || "None"
            },
            {
                name: "UPC",
                value: product.raw_upc || "None"
            },
            {
                name: "Nielsen UPC",
                value: product.nielsen_upc || "None"
            },
            {
                name: "Price",
                value: product.reading_price ? product.reading_price: null
            },
            {
                name: "Description",
                value: product.site_description
            },
            {
                name: "Category", // does the category need to be verified in order to be displayed?
                value: product.categories[0] && product.categories[0].name ? 
                product.categories[0].name : null
            },
            {
                name: "Subcategory", // does the category need to be verified in order to be displayed?
                value: product.subcategories[0] && product.subcategories[0].name ? 
                    product.subcategories[0].name : null
            },
            {
                name: "Breadcrumbs",
                value: product.bread_crumbs ? breadcrumbComponent(product.bread_crumbs) : null
            },
            {
                name: "URL",
                value: product.site_url ? <a href={product.site_url} target="_blank" rel="noopener noreferrer">{product.site_name} </a> : null
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
                                <PageIcon product={product.stores.name} />
                            </Grid>
                            <Grid item>
                                <PageTitle elevation={0}>{product.site_name}</PageTitle>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>               
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
                                {productDescItems && productDescItems.map((item, index) => (
                                    item.value && (
                                    <React.Fragment key={item.name}>
                                        <DetailItem ><b>{item.name}</b>: {item.value}</DetailItem>
                                    </React.Fragment>
                                    )
                                ))}
                                </div>
                                
                                <>
                                    {product.store_product_images && (
                                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                                            {product.store_product_images.length > 1 &&
                                                product.store_product_images.slice(1).map((imagePath, index) => (
                                                    <Grid key={index} item sm={4} md={4} lg={4}>
                                                        <Paper elevation={3} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleImageClick(imagePath)}>
                                                            <img
                                                                key={imagePath}
                                                                src={imagePathToUrl(imagePath)}
                                                                alt={product.site_name}
                                                                style={{ width: '100%', height: 'auto' }}
                                                            />
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    )}
                                    <Dialog open={selectedImage !== null} onClose={handleCloseDialog}>
                                        {selectedImage && (
                                            <>
                                                <DialogTitle>{product.site_name}</DialogTitle>
                                                <DialogContent>
                                                    <Box display="flex" justifyContent="center">
                                                        <img src={imagePathToUrl(selectedImage)} alt={product.site_name} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                                                    </Box>
                                                </DialogContent>
                                            </>
                                        )}
                                    </Dialog>
                                </>  

                            </Grid>
                            <Grid item xs={12} md={6}>
                                <div>
                                
                                    
                                    <>
                                        {product.store_product_images && product.store_product_images.length > 0 && (
                                            <ProductImageContainer style={{ display: 'flex', justifyContent: 'center' }}>
                                                <img
                                                    key={product.store_product_images[0]}
                                                    src={imagePathToUrl(product.store_product_images[0])}
                                                    alt={product.site_name}
                                                    width="50%"
                                                    onClick={handleOpen}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </ProductImageContainer>
                                        )}

                                        {product.store_product_images && product.store_product_images.length > 0 && (
                                            <Dialog open={open} onClose={handleClose}>
                                            <img
                                                key={product.store_product_images[0]}
                                                src={imagePathToUrl(product.store_product_images[0])}
                                                alt={product.site_name}
                                            />
                                            </Dialog>
                                        )}
                                    </>

                                    <Grid container justifyContent={"center"}>
                                            <Grid item xs={8}><Grid container direction="column-reverse" rowSpacing={2}>
                                                <NutritionFactsTable product={product} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    { product.ingredientEn && 
                                        <div>
                                            <ProductIngredientsHeadingContainer>
                                            <Divider> Ingredients</Divider>
                                            </ProductIngredientsHeadingContainer>
                                            <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>{product.ingredientEn.toLowerCase()}</Typography>
                                            
                                        </div>
                                    }
                                </div>
                            </Grid>
                        </Grid>
                    }
                </ProductInfoBox>
                <Divider variant="middle"/>
            </PageContainer>            
        </div>
    </div>
  )
}

export default Product_detail