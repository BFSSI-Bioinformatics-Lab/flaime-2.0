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
  Box
} from '@mui/material';

const CategoryVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationData, setVerificationData] = useState({});

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  const [searchParams] = useSearchParams();
  const scheme = searchParams.get('scheme');
  const source = searchParams.get('source');
  const view = searchParams.get('view') || 'verify';
  const preselectedUserId = searchParams.get('user');

  const isVerificationView = () => view === 'verify';

  const getPageTitle = () => {
    const titles = {
      'problematic': 'Review Problematic Verifications',
      'user-verifications': 'User Verification History',
      'default': 'Category Verification'
    };
    return titles[view] || titles.default;
  };

  const getPageDesc = () => {
    const titles = {
      'problematic': 'Most recent 50 shown',
      'user-verifications': 'Most recent 50 shown',
      'default': 'Random 10 shown'
    };
    return titles[view] || titles.default;
  };

  const getApiCall = () => {
    if (view === 'problematic') {
      return GetProblematicVerifications(parseInt(scheme), parseInt(source));
    }
    if (view === 'user-verifications') {
      const userId = preselectedUserId || selectedUser;
      return GetUserVerifications(
        parseInt(scheme), 
        parseInt(source), 
        userId ? parseInt(userId) : null
      );
    }
    return GetCategoriesToVerify(parseInt(scheme), parseInt(source));
  };

  const initializeVerificationData = (products, view) => {
    return products.reduce((acc, product) => {
      let category, problematicFlag;
      
      if (view === 'user-verifications' && product.verified_category) {
        category = product.verified_category.category_id;
        problematicFlag = product.problematic_flag || false;
      } else if (view === 'problematic') {
        const topPrediction = product.predictions?.reduce((prev, current) =>
          prev.confidence > current.confidence ? prev : current
        ) || {};
        category = product.verified_category?.category_id || topPrediction.category_id;
        problematicFlag = product.problematic_flag || false;
      } else {
        const topPrediction = product.predictions.reduce((prev, current) =>
          prev.confidence > current.confidence ? prev : current
        );
        category = topPrediction.category_id;
        problematicFlag = product.problematic_flag || false; // Use actual flag from product
      }

      acc[product.id] = {
        product_id: product.product_id,
        category: category,
        problematic_flag: problematicFlag
      };
      return acc;
    }, {});
  };

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

  const fetchProducts = async () => {
    try {
      const { error, products, message } = await getApiCall();
      if (error) throw new Error(message);
      
      console.log('Loaded products:', products);
      
      setProducts(products);
      setVerificationData(initializeVerificationData(products, view));
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch products: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scheme && source) {
      fetchProducts();
      if (view === 'user-verifications') {
        fetchUsers();
        if (preselectedUserId) {
          setSelectedUser(preselectedUserId);
        }
      }
    } else {
      setError('Missing required parameters: scheme and source');
      setLoading(false);
    }
  }, [scheme, source, view, selectedUser, preselectedUserId]);

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
        return true; // Success
      } else {
        setError('Some verifications failed to submit');
        return false;
      }
    } catch (err) {
      setError('Failed to submit verifications');
      return false;
    }
  };

  const handleSubmitAndReturn = async () => {
    const success = await handleSubmit();
    if (success) {
      window.location.href = '/tools/category-verification-setup';
    }
  };

  const handleSubmitAndLoadMore = async () => {
    const success = await handleSubmit();
    if (success) {
      await fetchProducts(); // Load new products
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



  const ProductLink = ({ product }) => (
    <Link 
      to={`/tools/product-browser/${product.id}`} 
      target="_blank"
      style={{
        color: '#023466ff',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
    >
      {product.product_name}
    </Link>
  );

  const CategorySelect = ({ product }) => (
    <Select
      value={verificationData[product.id]?.category || ''}
      onChange={(e) => handleCategoryChange(product.id, e.target.value)}
      fullWidth
      size="small"
    >
      {(product.predictions || [])
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
  );

  const ProblematicCell = ({ product }) => (
    <Checkbox
      checked={verificationData[product.id]?.problematic_flag || false}
      onChange={() => handleProblematicToggle(product.id)}
    />
  );



  return (
    <div className="p-8">
      <Typography variant="h4" className="mb-6">
        {getPageTitle()}
      </Typography>

      <Typography variant="p" className="mb-6">
        {getPageDesc()}
      </Typography>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>



      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>
                {isVerificationView() ? 'Predicted category' : 'Current verified category'}
              </TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>New category</TableCell>
              <TableCell>Flag for review?</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const topPrediction = product.predictions?.reduce((prev, current) =>
                prev.confidence > current.confidence ? prev : current
              ) || {};

              const displayCategory = view === 'user-verifications' && product.verified_category
                ? product.verified_category
                : topPrediction;

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductLink product={product} />
                  </TableCell>
                  <TableCell>{product.product_size}</TableCell>
                  <TableCell>
                    {displayCategory.category_name} ({displayCategory.category_code})
                  </TableCell>
                  <TableCell>
                    {displayCategory.confidence ? (displayCategory.confidence * 100).toFixed(1) + '%' : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <CategorySelect product={product} />
                  </TableCell>
                  <TableCell>
                    <ProblematicCell product={product} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

    {view !== 'read-only' && (
      <Box className="mt-8 space-x-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitAndReturn}
        >
          Submit and Return to Setup
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSubmitAndLoadMore}
        >
          Submit and Load Another 10
        </Button>
      </Box>
    )}
    </div>
  );
};

export default CategoryVerification;