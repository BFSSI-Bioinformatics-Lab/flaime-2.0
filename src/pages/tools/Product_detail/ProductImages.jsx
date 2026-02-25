import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Dialog, DialogContent, DialogTitle, Box, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const ProductImages = ({ product }) => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
  
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


    const handleOpenDialog = (index) => {
        setSelectedIndex(index);
        setIsImageLoading(true);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedIndex(null);
    };

    const handlePrev = () => {
        setIsZoomed(false);
        setIsImageLoading(true);
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setIsZoomed(false);
        setIsImageLoading(true);
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const imagePathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
    };

    const thumbPathToUrl = (imagePath) => {
        return `${process.env.REACT_APP_IMG_SERVER_URL}/thumb/${imagePath}`;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        setIsImageLoading(false);
    };

    return (
        <React.Fragment>
            {images && images.length > 0 && (
                <Grid container spacing={2} style={{ marginTop: '20px' }}>
                    {images.map((imagePath, index) => (
                        <Grid key={index} item xs={12} sm={4} md={4} lg={4}>
                            <Paper elevation={3} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleOpenDialog(index)}>
                                <img
                                    src={thumbPathToUrl(imagePath)}
                                    alt={product.site_name}
                                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                    onError={handleImageError}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                {selectedIndex !== null && images[selectedIndex] && (
                    <React.Fragment>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {product.site_name}
                            <span style={{ fontSize: '14px', color: 'gray' }}>
                                {selectedIndex + 1} / {images.length}
                            </span>
                        </DialogTitle>
                        <DialogContent>
                            <Box display="flex" justifyContent="center" alignItems="center" position="relative" minHeight="300px">
                                {images.length > 1 && (
                                    <IconButton 
                                        onClick={handlePrev} 
                                        sx={{ position: 'absolute', left: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                                    >
                                        <ArrowBackIosNewIcon />
                                    </IconButton>
                                )}

                                {isImageLoading && (
                                    <Box position="absolute" display="flex" justifyContent="center" alignItems="center" zIndex={5}>
                                        <CircularProgress />
                                    </Box>
                                )}

                                <img
                                    src={imagePathToUrl(images[selectedIndex])}
                                    alt={product.site_name}
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '80vh', 
                                        objectFit: 'contain',
                                        display: isImageLoading ? 'none' : 'block', 
                                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                        cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                                        transition: 'transform 0.3s ease-in-out'
                                    }} 
                                    onClick={() => setIsZoomed(!isZoomed)}
                                    onLoad={() => setIsImageLoading(false)}
                                    onError={handleImageError}
                                />

                                {images.length > 1 && (
                                    <IconButton 
                                        onClick={handleNext} 
                                        sx={{ position: 'absolute', right: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                                    >
                                        <ArrowForwardIosIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </DialogContent>
                    </React.Fragment>
                )}
            </Dialog>
        </React.Fragment>
    );
};

export default ProductImages;
