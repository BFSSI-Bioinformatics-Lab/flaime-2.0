import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const ProductImages = ({ product }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
          setIsLoading(true);
          try {
            const response = await axios.get(`${process.env.REACT_APP_ELASTIC_IMG_URL}/_doc/${product.id}`);
            const imageData = response.data._source;
            setImages(imageData.store_product_images || []);
          } catch (error) {
            console.error('Fetching images failed:', error);
            setError('Failed to load images');
            setImages([]);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchImages();
    }, [product.id]);

    const imagePathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
    };

    const thumbPathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/thumb/${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <React.Fragment>
            {images && images.length > 0 && (
                <PhotoProvider>
                    <Grid container spacing={2} style={{ marginTop: '20px' }}>
                        {images.map((imagePath, index) => (
                            <Grid key={index} item xs={12} sm={4} md={4} lg={4}>
                                <Paper elevation={3} style={{ padding: '10px', cursor: 'pointer' }}>
                                    <PhotoView src={imagePathToUrl(imagePath)}>
                                        <img
                                            src={thumbPathToUrl(imagePath)}
                                            alt={product.site_name}
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                            onError={handleImageError}
                                        />
                                    </PhotoView>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </PhotoProvider>
            )}
        </React.Fragment>
    );
};

export default ProductImages;