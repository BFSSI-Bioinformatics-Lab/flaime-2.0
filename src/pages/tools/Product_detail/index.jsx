import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Divider } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import { ProductInfoBox, PageIcon, PageTitle, DetailItem, ProductIngredientsHeadingContainer } from "./styles";
import axios from 'axios';
import NutritionFactsTable from '../../../components/nutrition_facts_table/NutritionFactsTable';
import ProductImages from './ProductImages';

const fetchData = async (productId, setProduct, setLoading) => {
    setLoading(true);
    try {
        const productResponse = await axios.get(`${process.env.REACT_APP_ELASTIC_URL}/_doc/${productId}`);
        if (!productResponse.data._source) throw new Error("Product data not found");

        let imageData = {};
        try {
            const imageResponse = await axios.get(`${process.env.REACT_APP_ELASTIC_IMG_URL}/_doc/${productId}`);
            imageData = imageResponse.data._source;
        } catch (imageError) {
            imageData.store_product_images = [];
        }

        const productInfo = { 
            ...productResponse.data._source, 
            store_product_images: imageData.store_product_images || []
        };
        setProduct(productInfo);
    } catch (error) {
        console.error('Fetching product failed:', error);
    } finally {
        setLoading(false);
    }
};

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetchData(productId, setProduct, setLoading);
    }, [productId]);

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    if (!product) {
        return <Typography>Error: Product not found.</Typography>;
    }

    const productDescItems = [
        { name: "Product Name", value: product.site_name },
        { name: "Brand", value: product.raw_brand || "None" },
        { name: "Store", value: product.store.name },
        { name: "Source", value: product.source.name },
        { name: "Product Code", value: product.store_product_code || "None" },
        { name: "UPC", value: product.raw_upc || "None" },
        { name: "Nielsen UPC", value: product.nielsen_upc || "None" },
        { name: "Price", value: product.reading_price || "Not available" },
        { name: "Description", value: product.site_description },
        { name: "Category", value: product.category.name || "Not specified" },
        { name: "Subcategory", value: product.subcategory.name || "Not specified" },
        { name: "Breadcrumbs", value: product.bread_crumbs ? product.bread_crumbs.join(" > ") : "None" },
        { name: "URL", value: product.site_url ? <a href={product.site_url} target="_blank" rel="noopener noreferrer">{product.site_name}</a> : "Not available" }
    ].filter(item => item.value);

    return (
        <div>
            <Band>
                <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                    <PageIcon product={product.store.name} />
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
                            {product.ingredients && product.ingredients.en && (
                                <div>
                                    <ProductIngredientsHeadingContainer>
                                        <Divider> Ingredients </Divider>
                                    </ProductIngredientsHeadingContainer>
                                    <Typography variant="body2" style={{ padding: '10px', textTransform: 'capitalize' }}>
                                        {product.ingredients.en.toLowerCase()}
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
