import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { GetAllSources } from '../../../api/services/SourceService';
import { GetAllCategorySchemes } from '../../../api/services/CategoryService';

const CategoryVerificationSetup = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLaunchVerification = () => {
    if (selectedScheme && selectedSource) {
      navigate(`/tools/verify-categories?scheme=${selectedScheme}&source=${selectedSource}`);
    }
  };

  const handleQuickLaunch = (scheme, source) => {
    navigate(`/tools/verify-categories?scheme=${scheme}&source=${source}`);
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

  // Create some predefined combinations based on your actual data
  const predefinedCombinations = schemes.slice(0, 3).flatMap(scheme => 
    sources.slice(0, 2).map(source => ({
      scheme: scheme.id,
      source: source.id,
      name: `${scheme.name} - ${source.name}`
    }))
  );

  return (
    <div className="p-8">
      <Typography variant="h4" className="mb-6">
        Category Verification Setup
      </Typography>

      <Grid container spacing={4}>
        {/* Custom Selection */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4">
              Custom Verification
            </Typography>
            
            <Box className="space-y-4">
              <FormControl fullWidth>
                <InputLabel>Classification Scheme</InputLabel>
                <Select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  label="Classification Scheme"
                >
                  {schemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Data Source</InputLabel>
                <Select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  label="Data Source"
                >
                  {sources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLaunchVerification}
                disabled={!selectedScheme || !selectedSource}
                className="mt-4"
              >
                Start Category Verification
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Launch Options */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6">
            <Typography variant="h6" className="mb-4">
              Quick Launch
            </Typography>
            
            <Box className="space-y-3">
              {predefinedCombinations.map((combo, index) => (
                <Card key={index} variant="outlined">
                  <CardContent className="pb-2">
                    <Typography variant="subtitle1">
                      {combo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheme: {combo.scheme} | Source: {combo.source}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleQuickLaunch(combo.scheme, combo.source)}
                    >
                      Launch
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Paper className="p-6 mt-6">
        <Typography variant="h6" className="mb-3">
          How to Use
        </Typography>
        <Typography variant="body1" className="mb-2">
          1. Select a classification scheme and data source combination
        </Typography>
        <Typography variant="body1" className="mb-2">
          2. Click "Start Category Verification" to begin reviewing predictions
        </Typography>
        <Typography variant="body1">
          3. The system will show you up to 10 random products that need manual verification
        </Typography>
      </Paper>
    </div>
  );
};

export default CategoryVerificationSetup;