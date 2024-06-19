import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Divider } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import Band from '../../../components/page/Band';
import { ProductInfoBox, PageIcon, PageTitle, DetailItem, ProductIngredientsHeadingContainer } from "./styles";
import axios from 'axios';
import NutritionFactsTable from '../../../components/nutrition_facts_table/NutritionFactsTable';
import ProductImages from './ProductImages';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await axios.get(`${process.env.REACT_APP_ELASTIC_URL}/_doc/${productId}`);
                const imageData = await axios.get(`${process.env.REACT_APP_ELASTIC_IMG_URL}/_doc/${productId}`);
                if (!productData.data._source || !imageData.data._source) throw new Error("Data not found");
                const productInfo = { ...productData.data._source, store_product_images: imageData.data._source.store_product_images };
                setProduct(productInfo);
            } catch (error) {
                console.error('Fetching product failed:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [productId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    console.log("Product:", product);
    const productDescItems = product ? [
        { name: "Product Name", value: product.site_name },
        { name: "Brand", value: product.raw_brand || "None" },
        { name: "Store", value: product.stores.name },
        { name: "Source", value: product.sources.name },
        { name: "Product Code", value: product.store_product_code || "None" },
        { name: "UPC", value: product.raw_upc || "None" },
        { name: "Nielsen UPC", value: product.nielsen_upc || "None" },
        { name: "Price", value: product.reading_price || "Not available" },
        { name: "Description", value: product.site_description },
        { name: "Category", value: product.categories[0]?.name || "Not specified" },
        { name: "Subcategory", value: product.subcategories[0]?.name || "Not specified" },
        { name: "Breadcrumbs", value: product.bread_crumbs ? product.bread_crumbs.join(" > ") : "None" },
        { name: "URL", value: product.site_url ? <a href={product.site_url} target="_blank" rel="noopener noreferrer">{product.site_name}</a> : "Not available" },
    ] : [];

    return (
        <div>
            <Band>
                <Grid container spacing={1} direction="row" justifyContent="space-between" alignItems="center">
                    <Grid item xs={12} md={12}>
                        <Grid container alignItems="center" wrap="nowrap">
                            <Grid item><PageIcon product={product.stores.name} /></Grid>
                            <Grid item><PageTitle>{product.site_name}</PageTitle></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Band>
            <PageContainer>
                <ProductInfoBox>
                    {product && (
                        <Grid container columnSpacing={6} direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Grid item xs={12} md={6}>
                                
                                {productDescItems.map(item => (
                                    item.value && <DetailItem key={item.name}><b>{item.name}</b>: {item.value}</DetailItem>
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
                            <Grid item xs={12} md={6} style={{ margin: '0 auto', maxWidth: '500px' }}>
                                <NutritionFactsTable product={product} />
                                
                                <div>
                                <ProductImages product={product} />
                                </div>
                            </Grid>
                        </Grid>
                    )}
                </ProductInfoBox>
                <Divider variant="middle" />
            </PageContainer>
        </div>
    );
}

export default ProductDetail;
