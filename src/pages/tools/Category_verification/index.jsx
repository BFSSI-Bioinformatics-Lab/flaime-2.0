import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../../context/auth/AuthContext';
import { GetCategoriesToVerify } from '../../../api/services/CategoryVerificationService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Typography
} from '@mui/material';

const CategoryVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationData, setVerificationData] = useState({});
  const { user } = useAuth();
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { error, products, message } = await GetCategoriesToVerify();
      if (error) {
        throw new Error(message);
      }

      const uniqueProducts = Object.values(
        products.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {})
      );
      
      setProducts(uniqueProducts);
      
      const initialVerificationData = uniqueProducts.reduce((acc, product) => {
        acc[product.id] = {
          category: product.predicted_category.id,
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

  const handleCategoryChange = (productId, event) => {
    setVerificationData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        category: parseInt(event.target.value)
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
      user: user.id
    }));

    try {
      const results = await Promise.all(
        verifications.map(verification =>
          fetch('/api/category-verifications/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Category Verification
      </Typography>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Current Category</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>New Category</TableCell>
              <TableCell>Problematic</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={`${product.id}-${product.product_name}`}>
                <TableCell>{product.product_name}</TableCell>
                <TableCell>{product.predicted_category.name}</TableCell>
                <TableCell>{(product.confidence * 100).toFixed(1)}%</TableCell>
                <TableCell>
                  <Select
                    value={verificationData[product.id]?.category}
                    onChange={(e) => handleCategoryChange(product.id, e)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value={765}>Category 1</MenuItem>
                    <MenuItem value={766}>Category 2</MenuItem>
                    <MenuItem value={767}>Category 3</MenuItem>
                    <MenuItem value={768}>Category 4</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={verificationData[product.id]?.problematic_flag}
                    onChange={() => handleProblematicToggle(product.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button 
        variant="contained" 
        color="primary"
        onClick={handleSubmit}
        style={{ marginTop: '2rem' }}
      >
        Submit Verifications
      </Button>
    </div>
  );
};

export default CategoryVerification;