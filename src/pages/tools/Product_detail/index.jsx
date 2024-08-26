import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Divider } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import { ProductInfoBox, PageIcon, PageTitle, DetailItem, ProductIngredientsHeadingContainer } from "./styles";
import axios from 'axios';
import NutritionFactsTable from '../../../components/nutrition_facts_table/NutritionFactsTable';
import ProductImages from './ProductImages';
import { GetStoreProductByID } from '../../../api/services/ProductService';


const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        { name: "Product Code", value: product.store_product_code || "None" },
        { name: "UPC", value: product.raw_upc || "None" },
        { name: "Price", value: product.reading_price || "Not available" },
        { name: "Description", value: product.site_description },
        { name: "Category", value: product.category || "Not specified" },
        { name: "Subcategory", value: product.subcategory || "Not specified" },
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
                            {product.ingredient_en && (
                                <div>
                                    <ProductIngredientsHeadingContainer>
                                        <Divider> Ingredients </Divider>
                                    </ProductIngredientsHeadingContainer>
                                    <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>
                                        {product.ingredient_en.toLowerCase()}
                                    </Typography>
                                </div>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ margin: 'auto', maxWidth: 500 }}>
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
