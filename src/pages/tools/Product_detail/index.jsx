import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Divider, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import { ProductInfoBox, PageIcon, PageTitle, DetailItem, ProductIngredientsHeadingContainer, ExpandMore, DescriptionHeader } from "./styles";
import NutritionFactsTable from '../../../components/nutrition_facts_table/NutritionFactsTable';
import ProductImages from './ProductImages';
import CategoryDisplay from '../../../components/category_display/CategoryDisplay';
import SupplementedFoodFlags from '../../../components/supp_food_flags/SupplementedFoodFlags';
import { GetStoreProductByID } from '../../../api/services/ProductService';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProductData = async () => {
            setLoading(true);
            setError(null);
            console.log("Fetching product data...");
            const result = await GetStoreProductByID(productId, controller);
            console.log("API result:", result);
            if (result.error) {
                setError(result.message);
            } else {
                setProduct(result.data);
            }
            setLoading(false);
        };

        fetchProductData();

        return () => controller.abort();
    }, [productId]);

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography>Error: {error}</Typography>;
    }

    if (!product) {
        return <Typography>Error: Product not found.</Typography>;
    }

    const productDescItems = [
        { name: "Product Name", value: product.site_name },
        { name: "Brand", value: product.raw_brand || product.product?.brand || "None" },
        { name: "Store", value: product.store },
        { name: "Source", value: product.source },
        { name: "External ID", value: product.external_id },
        { name: "Product Code", value: product.store_product_code || "None" },
        { name: "UPC", value: product.raw_upc || "None" },
        { name: "Price", value: product.reading_price || "Not available" },
        { name: "Total Size", value: product.total_size || "Not specified" },
        { name: "Serving Size", value: product.raw_serving_size || "Not specified" },
        { name: "URL", value: product.site_url ? <a href={product.site_url} target="_blank" rel="noopener noreferrer">{product.site_name}</a> : "Not available" }
    ].filter(item => item.value);

    return (
        <div>
            <Band>
                <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                    <PageIcon product={product.store} />
                    <PageTitle>{product.site_name}</PageTitle>
                </Grid>
            </Band>
            <PageContainer>
                <ProductInfoBox>
                    <Grid container spacing={6} alignItems="flex-start">
                        <Grid item xs={12} md={6}>
                            {productDescItems.map(item => (
                                <DetailItem key={item.name}><b>{item.name}</b>: {item.value}</DetailItem>
                            ))}
                            {product.site_description && (
                                <DetailItem>
                                    <DescriptionHeader onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                                        <b>Site description or Package text (click to show)</b>
                                        <ExpandMore
                                            expand={descriptionExpanded}
                                            aria-expanded={descriptionExpanded}
                                            aria-label="show more"
                                        >
                                            <ExpandMoreIcon />
                                        </ExpandMore>
                                    </DescriptionHeader>
                                    <Collapse in={descriptionExpanded} timeout="auto" unmountOnExit>
                                        <Typography variant="body2" style={{ marginTop: '8px' }}>
                                            {product.site_description}
                                        </Typography>
                                    </Collapse>
                                </DetailItem>
                            )}
                            {product.product?.categories && 
                            Object.values(product.product.categories).some(data => 
                            data.manual?.length > 0 || data.predicted?.length > 0
                            ) && (
                                    <div style={{ marginTop: '20px' }}>
                                    <ProductIngredientsHeadingContainer>
                                        <Divider> Categories </Divider>
                                    </ProductIngredientsHeadingContainer>
                                    <CategoryDisplay categories={product.product.categories} />
                                </div>
                            )}
                            {product.ingredient_en || product.ingredient_fr (
                            <div>
                                <ProductIngredientsHeadingContainer>
                                    <Divider> Ingredients </Divider>
                                </ProductIngredientsHeadingContainer>
                                <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>
                                    {product.ingredient_en.toLowerCase()}
                                </Typography>
                                <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>
                                    {product.ingredient_fr.toLowerCase()}
                                </Typography>
                            </div>
                            )}
                            {product.product?.supplemented_food && product.label_flags && (
                                <div style={{ marginTop: '20px' }}>
                                    <ProductIngredientsHeadingContainer>
                                        <Divider> Supplemented Food Flags </Divider>
                                    </ProductIngredientsHeadingContainer>
                                    <SupplementedFoodFlags labelFlags={product.label_flags} />
                                </div>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ maxWidth: 500 }}>
                            <NutritionFactsTable product={product} />
                            <ProductImages product={product} />
                        </Grid>
                    </Grid>
                </ProductInfoBox>
                <Divider variant="middle" />
            </PageContainer>
        </div>
    );
}

export default ProductDetail;