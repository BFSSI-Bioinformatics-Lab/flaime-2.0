import React, { useState, useEffect } from 'react';
import { GetCategoriesToVerify } from '../../../api/services/CategoryVerificationService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Select, MenuItem, Checkbox, Button,
  Alert, Snackbar, CircularProgress, Typography,
  Dialog, DialogContent, Box
} from '@mui/material';

const imagePathToUrl = (imagePath) => {
  return `${process.env.REACT_APP_IMG_SERVER_URL}/images/${imagePath}`;
};

const CategoryVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationData, setVerificationData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { error, products, message } = await GetCategoriesToVerify();
      if (error) throw new Error(message);

      setProducts(products);

      const initialVerificationData = products.reduce((acc, product) => {
        const topPrediction = product.predictions.reduce((prev, current) =>
          prev.confidence > current.confidence ? prev : current
        );

        acc[product.id] = {
          category: topPrediction.category_id,
          problematic_flag: false
        };
        return acc;
      }, {});

      setVerificationData(initialVerificationData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch products: ' + err.message);
      setLoading(false);
    }
  };

  const handleCategoryChange = (productId, categoryId) => {
    setVerificationData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        category: parseInt(categoryId)
      }
    }));
  };

  const handleProblematicToggle = (productId) => {
    setVerificationData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        problematic_flag: !prev[productId].problematic_flag
      }
    }));
  };

  const handleSubmit = async () => {
    const verifications = Object.entries(verificationData).map(([productId, data]) => ({
      product: parseInt(productId),
      category: data.category,
      problematic_flag: data.problematic_flag,
      user: ''
    }));

    try {
      const results = await Promise.all(
        verifications.map(verification =>
          fetch('/api/category-verifications/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verification)
          })
        )
      );

      if (results.every(res => res.ok)) {
        setSuccessMessage('Categories successfully verified!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Some verifications failed to submit');
      }
    } catch (err) {
      setError('Failed to submit verifications');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Typography variant="h4" className="mb-6">
        Category Verification
      </Typography>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent className="p-0">
          <div className="w-full h-96 flex items-center justify-center bg-gray-100">
            {selectedImage && (
              <img
                src={imagePathToUrl(selectedImage)}
                alt="Product"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Current Category</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>New Category</TableCell>
              <TableCell>Problematic</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const topPrediction = product.predictions.reduce((prev, current) =>
                prev.confidence > current.confidence ? prev : current
              );

              const imagePath = product.store_product_images[0]?.image_path;

              return (
                <TableRow key={product.id}>
                  <TableCell sx={{ width: 60 }}>
                    <div style={{ width: 40, height: 40 }}>
                      {imagePath && (
                        <img
                          src={imagePathToUrl(imagePath)}
                          alt={product.product_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedImage(imagePath)}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.product_size}</TableCell>
                  <TableCell>
                    {topPrediction.category_name} ({topPrediction.category_code})
                  </TableCell>
                  <TableCell>
                    {(topPrediction.confidence * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Select
                      value={verificationData[product.id]?.category}
                      onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                      fullWidth
                      size="small"
                    >
                      {product.predictions
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((prediction) => (
                          <MenuItem
                            key={`${prediction.category_id}-${product.id}`}
                            value={prediction.category_id}
                          >
                            {prediction.category_name} ({prediction.category_code}) -
                            {(prediction.confidence * 100).toFixed(1)}%
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={verificationData[product.id]?.problematic_flag}
                      onChange={() => handleProblematicToggle(product.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        className="mt-8"
      >
        Submit Verifications
      </Button>
    </div>
  );
};

export default CategoryVerification;