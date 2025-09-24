import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import { GetAllSources } from '../../../api/services/SourceService';
import { GetAllCategorySchemes } from '../../../api/services/CategoryService';
import { GetVerificationStats } from '../../../api/services/CategoryVerificationService';

const CategoryVerificationSetup = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [sources, setSources] = useState([]);
  const [verificationStats, setVerificationStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const predefinedCombinations = [
    { sourceId: 178, schemeId: 9, name: "Source 178 - Scheme 9" },
    { sourceId: 178, schemeId: 10, name: "Source 178 - Scheme 10" },
    { sourceId: 2, schemeId: 10, name: "Source 2 - Scheme 10" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schemesResult, sourcesResult] = await Promise.all([
        GetAllCategorySchemes(),
        GetAllSources()
      ]);

      if (schemesResult.error) {
        throw new Error('Failed to fetch schemes: ' + schemesResult.message);
      }
      if (sourcesResult.error) {
        throw new Error('Failed to fetch sources: ' + sourcesResult.message);
      }

      setSchemes(schemesResult.categories);
      setSources(sourcesResult.sources);
      
      await fetchVerificationStats();
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchVerificationStats = async () => {
    const stats = {};
    for (const combo of predefinedCombinations) {
      try {
        const result = await GetVerificationStats(combo.schemeId, combo.sourceId);
        if (result.error) {
          console.warn(`Failed to fetch stats for ${combo.sourceId}-${combo.schemeId}:`, result.message);
          stats[`${combo.sourceId}-${combo.schemeId}`] = { total: 0, verified: 0, pending: 0 };
        } else {
          stats[`${combo.sourceId}-${combo.schemeId}`] = result.stats;
        }
      } catch (err) {
        console.error(`Error fetching stats for ${combo.sourceId}-${combo.schemeId}:`, err);
        stats[`${combo.sourceId}-${combo.schemeId}`] = { total: 0, verified: 0, pending: 0 };
      }
    }
    setVerificationStats(stats);
  };

  const getSchemeById = (id) => schemes.find(scheme => scheme.id === id);
  const getSourceById = (id) => sources.find(source => source.id === id);

  const handleLaunchVerification = (sourceId, schemeId) => {
    navigate(`/tools/verify-categories?scheme=${schemeId}&source=${sourceId}`);
  };

  const getProgressPercentage = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.verified / stats.total) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Typography variant="h4" className="mb-2">
        Category Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" className="mb-6">
        Review and verify product categorizations for quality assurance
      </Typography>

      <Grid container spacing={3}>
        {predefinedCombinations.map((combo) => {
          const scheme = getSchemeById(combo.schemeId);
          const source = getSourceById(combo.sourceId);
          const stats = verificationStats[`${combo.sourceId}-${combo.schemeId}`] || { total: 0, verified: 0, pending: 0 };
          const progressPercentage = getProgressPercentage(stats);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={`${combo.sourceId}-${combo.schemeId}`}>
              <Card variant="outlined" className="h-full">
                <CardContent>
                  <Box className="flex justify-between items-start mb-3">
                    <Typography variant="h6" component="h3">
                      {source?.name || `Source ${combo.sourceId}`}
                    </Typography>
                    <Chip 
                      label={scheme?.name || `Scheme ${combo.schemeId}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Divider className="mb-3" />
                  
                  <Box className="space-y-3">
                    <Box className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressPercentage} 
                      color={getStatusColor(progressPercentage)}
                      className="mb-2"
                    />
                    
                    <Grid container spacing={2} className="text-sm">
                      <Grid item xs={4}>
                        <Box className="text-center">
                          <Typography variant="h6" color="primary">
                            {stats.total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="text-center">
                          <Typography variant="h6" color="success.main">
                            {stats.verified}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Verified
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="text-center">
                          <Typography variant="h6" color="warning.main">
                            {stats.pending}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pending
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleLaunchVerification(combo.sourceId, combo.schemeId)}
                    disabled={stats.pending === 0}
                  >
                    {stats.pending === 0 ? 'Complete' : 'Continue Verification'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper className="p-6 mt-6">
        <Typography variant="h6" className="mb-3">
          Verification Process
        </Typography>
        <Typography variant="body2" className="mb-2">
          • Each session presents up to 10 random unverified products
        </Typography>
        <Typography variant="body2" className="mb-2">
          • Review the predicted category and confirm or correct as needed
        </Typography>
        <Typography variant="body2">
          • Your verifications help improve categorization accuracy across the system
        </Typography>
      </Paper>
    </div>
  );
};

export default CategoryVerificationSetup;