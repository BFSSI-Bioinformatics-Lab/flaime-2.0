import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  GetCategoriesToVerify, 
  SubmitCategoryVerification, 
  GetProblematicVerifications, 
  GetUserVerifications,
  GetAllUsers 
} from '../../../api/services/CategoryVerificationService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Select, MenuItem, Checkbox, Button,
  Alert, Snackbar, CircularProgress, Typography,
  Dialog, DialogContent, Box, FormControl, InputLabel
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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  const [searchParams] = useSearchParams();
  
  const scheme = searchParams.get('scheme');
  const source = searchParams.get('source');
  const view = searchParams.get('view') || 'verify'; // 'verify', 'problematic', 'user-verifications'
  const preselectedUserId = searchParams.get('user'); // User ID from URL

  useEffect(() => {
    if (scheme && source) {
      fetchProducts();
      if (view === 'user-verifications') {
        fetchUsers();
        // Set preselected user if provided in URL
        if (preselectedUserId) {
          setSelectedUser(preselectedUserId);
        }
      }
    } else {
      setError('Missing required parameters: scheme and source');
      setLoading(false);
    }
  }, [scheme, source, view, selectedUser, preselectedUserId]);

  const fetchUsers = async () => {
    try {
      const { error, users, message } = await GetAllUsers();
      if (error) {
        console.error('Failed to fetch users:', message);
      } else {
        setUsers(users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const getPageTitle = () => {
    switch (view) {
      case 'problematic':
        return 'Review Problematic Verifications';
      case 'user-verifications':
        return 'User Verification History';
      default:
        return 'Category Verification';
    }
  };

  const isReadOnlyView = () => {
    return view === 'problematic' || view === 'user-verifications';
  };

  const fetchProducts = async () => {
    try {
      let result;
      
      if (view === 'problematic') {
        result = await GetProblematicVerifications(parseInt(scheme), parseInt(source));
      } else if (view === 'user-verifications') {
        result = await GetUserVerifications(
          parseInt(scheme), 
          parseInt(source), 
          selectedUser || null
        );
      } else {
        result = await GetCategoriesToVerify(parseInt(scheme), parseInt(source));
      }

      const { error, products, message } = result;

      if (error) throw new Error(message);

      setProducts(products);

      if (view === 'verify') {
        // Only set up verification data for the main verification view
        const initialVerificationData = products.reduce((acc, product) => {
          const topPrediction = product.predictions.reduce((prev, current) =>
            prev.confidence > current.confidence ? prev : current
          );

          acc[product.id] = {
            product_id: product.product_id,
            category: topPrediction.category_id,
            problematic_flag: false
          };
          return acc;
        }, {});

        setVerificationData(initialVerificationData);
      }
      
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
      product: data.product_id,
      category: data.category,
      problematic_flag: data.problematic_flag
    }));

    try {
      const results = await Promise.all(
        verifications.map(verification => 
          SubmitCategoryVerification(verification)
        )
      );

      if (results.every(result => !result.error)) {
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

  if (!scheme || !source) {
    return (
      <div className="p-8">
        <Typography variant="h4" className="mb-6">
          Category Verification
        </Typography>
        <Alert severity="error">
          Missing required parameters. Please access this page through the verification setup.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Typography variant="h4" className="mb-6">
        {getPageTitle()}
      </Typography>

      {view === 'user-verifications' && (
        <Box className="mb-4">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Filter by User"
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username || user.email || `User ${user.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

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
              <TableCell>Product name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>
                {view === 'user-verifications' ? 'Verified category' : 'Predicted category'}
              </TableCell>
              <TableCell>Confidence</TableCell>
              {!isReadOnlyView() && <TableCell>New category</TableCell>}
              <TableCell>
                {view === 'problematic' ? 'Problematic' : 'Flag for review?'}
              </TableCell>
              {view === 'user-verifications' && <TableCell>Verified by</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const topPrediction = product.predictions?.reduce((prev, current) =>
                prev.confidence > current.confidence ? prev : current
              ) || {};
              
              // For user verifications, show the verified category info
              const displayCategory = view === 'user-verifications' && product.verified_category
                ? product.verified_category
                : topPrediction;

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link 
                      to={`/tools/product-browser/${product.id}`} 
                      target="_blank"
                      style={{
                        color: '#1976d2',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {product.product_name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.product_size}</TableCell>
                  <TableCell>
                    {displayCategory.category_name} ({displayCategory.category_code})
                  </TableCell>
                  <TableCell>
                    {displayCategory.confidence ? (displayCategory.confidence * 100).toFixed(1) + '%' : 'N/A'}
                  </TableCell>
                  {!isReadOnlyView() && (
                    <TableCell>
                      <Select
                        value={verificationData[product.id]?.category || ''}
                        onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                        fullWidth
                        size="small"
                      >
                        {product.predictions
                          ?.sort((a, b) => b.confidence - a.confidence)
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
                  )}
                  <TableCell>
                    {isReadOnlyView() ? (
                      <Typography variant="body2" color={product.problematic_flag ? 'error' : 'text.secondary'}>
                        {product.problematic_flag ? 'Yes' : 'No'}
                      </Typography>
                    ) : (
                      <Checkbox
                        checked={verificationData[product.id]?.problematic_flag || false}
                        onChange={() => handleProblematicToggle(product.id)}
                      />
                    )}
                  </TableCell>
                  {view === 'user-verifications' && (
                    <TableCell>
                      <Typography variant="body2">
                        {product.verified_by_username || product.verified_by || 'Unknown'}
                      </Typography>
                      {product.verified_at && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(product.verified_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {!isReadOnlyView() && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className="mt-8"
        >
          Submit Verifications
        </Button>
      )}
    </div>
  );
};

export default CategoryVerification;