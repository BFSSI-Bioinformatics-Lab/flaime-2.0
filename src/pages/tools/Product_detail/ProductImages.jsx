import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Dialog, DialogContent, DialogTitle, Box } from '@mui/material';

const ProductImages = ({ product }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
  
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


    const handleOpenDialog = (imagePath) => {
        setSelectedImage(imagePath);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedImage(null);
    };

    const imagePathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <React.Fragment>
            {images && (
                <Grid container spacing={2} style={{ marginTop: '20px' }}>
                    {images.map((imagePath, index) => (
                        <Grid key={index} item sm={4} md={4} lg={4}>
                            <Paper elevation={3} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleOpenDialog(imagePath)}>
                                <img
                                    src={imagePathToUrl(imagePath)}
                                    alt={product.site_name}
                                    style={{ width: '100%', height: 'auto' }}
                                    onError={handleImageError}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                {selectedImage && (
                    <React.Fragment>
                        <DialogTitle>{product.site_name}</DialogTitle>
                        <DialogContent>
                            <Box display="flex" justifyContent="center">
                                <img
                                    src={imagePathToUrl(selectedImage)}
                                    alt={product.site_name}
                                    style={{ maxWidth: '100%', maxHeight: '80vh' }} 
                                    onError={handleImageError}
                                />
                            </Box>
                        </DialogContent>
                    </React.Fragment>
                )}
            </Dialog>
        </React.Fragment>
    );
};

export default ProductImages;
