import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { TextField, Button, Alert, Typography, Divider, Grid, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import CategorySelector from '../../../components/inputs/CategorySelector';
import NutritionFilter from '../../../components/inputs/NutritionFilter';
import { useSearchFilters, buildTextMustClausesForAllFields } from '../util';
import ColumnSelection  from '../../../components/table/ColumnSelection';
import ToolTable  from '../../../components/table/ToolTable';
import SearchResultSummary from '../../../components/misc/SearchResultSummary';
import { ResetButton } from '../../../components/buttons/ResetButton';
import { DownloadResultButton } from '../../../components/buttons/DownloadResultButton';

const AdvancedSearch = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    const initialFilters = {
        Names: '',
        IDs: '',
        ExternalIDs: '',
        UPCs: '',
        NielsenUPCs: '',
        Storage: '',
        Packaging: '',
        Allergens: '',
        Categories: { value: [] },
        Source: { value: null },
        Store: { value: null },
        Region: { value: null },
        StartDate: { value: null },
        EndDate: { value: null },
        Nutrition: { nutrient: '', minAmount: '', maxAmount: '' },
    };
    
    const [searchInputs, handleInputChange] = useSearchFilters(initialFilters);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [totalProducts, setTotalProducts] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [resetKey, setResetKey] = useState(0);
    const [storageOptions, setStorageOptions] = useState([]);
    const [packagingOptions, setPackagingOptions] = useState([]);

    const [columnsVisibility, setColumnsVisibility] = useState({
        id: true,
        external_id: true,
        name: true,
        price: true,
        source: true,
        store: true,
        date: true,
        region: true,
        categories: true,
        storage_condition: false, // Default to hidden
        primary_package_material: false,
        allergens_warnings: false,
    });
    
    const [selectedColumns, setSelectedColumns] = useState(Object.keys(columnsVisibility));

    useEffect(() => {
        const fetchSearchOptions = async () => {
            try {
                const response = await fetch('/api/options/');
                if (response.ok) {
                    const data = await response.json();
                    if(data.storage) setStorageOptions(data.storage);
                    if(data.packaging) setPackagingOptions(data.packaging);
                } else {
                    console.warn("Failed to fetch search options");
                }
            } catch (error) {
                console.error("Error fetching search options:", error);
            }
        };
        fetchSearchOptions();
    }, []);

    const handleReset = () => {
        Object.keys(initialFilters).forEach(key => {
            handleInputChange(key, initialFilters[key]);
        });
        
        setSearchResults([]);
        setIsLoading(false);
        setTotalProducts(0);
        setPage(0);
        setRowsPerPage(25);
        setErrorMessage('');
        setResetKey(prev => prev + 1);
        setSelectedColumns(Object.keys(columnsVisibility));
    };

    const handleColumnSelection = (event) => {
        setSelectedColumns(event.target.value);
    };

    const handleTextFieldChange = (field) => (event) => {
        handleInputChange(field, event.target.value);
        if (errorMessage) setErrorMessage('');
    };

    const handleSelectChange = (field) => (event) => {
        handleInputChange(field, event.target.value);
    };
    
    const buildQueryObject = useCallback(() => {
        const textMustClauses = buildTextMustClausesForAllFields(searchInputs);
        
        let nutrientQuery = {
            nested: {
                path: "nutrition_details",
                query: {
                    bool: {
                        must: []
                    }
                }
            }
        };
        
        if (searchInputs.Nutrition.nutrient) {
            nutrientQuery.nested.query.bool.must.push({
                term: {
                    "nutrition_details.nutrient_id": searchInputs.Nutrition.nutrient
                }
            });
        }
        
        let amountRange = {};
        if (searchInputs.Nutrition.minAmount) {
            amountRange.gte = parseFloat(searchInputs.Nutrition.minAmount);
        }
        if (searchInputs.Nutrition.maxAmount) {
            amountRange.lte = parseFloat(searchInputs.Nutrition.maxAmount);
        }
        
        if (Object.keys(amountRange).length > 0) {
            nutrientQuery.nested.query.bool.must.push({
                range: {
                    "nutrition_details.amount": amountRange
                }
            });
        }
        
        return {
            bool: {
                must: [
                    ...textMustClauses,
                    ...(nutrientQuery.nested.query.bool.must.length > 0 ? [nutrientQuery] : [])
                ]
            }
        };
        
    }, [searchInputs]);

    const handleSearch = async (newPage = page, currentRowsPerPage = rowsPerPage) => {
        setIsLoading(true);
        
        const queryObject = buildQueryObject();
        
        const finalQuery = {
            from: newPage * currentRowsPerPage,
            size: currentRowsPerPage,
            query: queryObject
        };
        
        const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
        
        try {
            const response = await fetch(elastic_url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(finalQuery)
            });
            
            const data = await response.json();
            console.log("Elasticsearch response:", JSON.stringify(data, null, 2));
            
            if (response.ok) {
                console.log("Search successful, hits:", data.hits.hits.length);
                setSearchResults(data.hits.hits);
                setTotalProducts(data.hits.total.value);
            } else {
                console.error('Search API error:', data.error || data);
                setSearchResults([]);   
            }
        } catch (error) {
            console.error('Search request failed:', error);
            setSearchResults([]);
        }
        
        setIsLoading(false);
    };
    const currentQueryBody = buildQueryObject();
      
    const handleSelectorChange = (field) => (value) => {
        handleInputChange(field, { value: value === '-1' ? null : value });
    };

    const handleCategoryChange = (field) => (value) => {
        handleInputChange(field, { value });
    };

    const handleNutritionChange = (nutrition) => {
        handleInputChange('Nutrition', nutrition);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        handleSearch(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        handleSearch(0, newRowsPerPage);
    };

    return (
        <PageContainer>
            <div style={{ padding: '20px' }}>
                {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
                
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Advanced Search</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Enter search terms in any or all of the fields. Note that some fields are only relevant for certain datasets.
                </Typography>
                
                <Divider sx={{ mb: 4 }} />

                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>Product Info</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                        { label: "Product Name", field: "Names" },
                        { label: "Product ID", field: "IDs" },
                        { label: "External ID", field: "ExternalIDs" },
                        { label: "UPC", field: "UPCs" },
                        { label: "Nielsen UPC", field: "NielsenUPCs" }
                    ].map((item) => (
                        <Grid item xs={12} sm={6} md={2.4} key={item.field}>
                            <TextField
                                fullWidth
                                label={item.label}
                                value={searchInputs[item.field]}
                                onChange={handleTextFieldChange(item.field)}
                                variant="outlined"
                            />
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 4 }} />

                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>Attributes & Location</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }} alignItems="flex-end">
                    {/* Storage Condition */}
                    <Grid item xs={12} sm={6} md={3} lg={2.4}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel>Storage Condition</InputLabel>
                            <Select
                                value={searchInputs.Storage}
                                onChange={handleSelectChange('Storage')}
                                label="Storage Condition"
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {storageOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2.4}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel>Packaging Material</InputLabel>
                            <Select
                                value={searchInputs.Packaging}
                                onChange={handleSelectChange('Packaging')}
                                label="Packaging Material"
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {packagingOptions.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2.4}>
                        <SourceSelector 
                            value={searchInputs.Source.value} 
                            onSelect={handleSelectorChange('Source')} 
                            showTitle={false}
                            label="Source" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={2.4}>
                        <RegionSelector 
                            value={searchInputs.Region.value} 
                            onSelect={handleSelectorChange('Region')} 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={2.4}>
                        <StoreSelector 
                            value={searchInputs.Store.value} 
                            onSelect={handleSelectorChange('Store')} 
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <CategorySelector key={resetKey} onChange={handleCategoryChange('Categories')} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" sx={{ mb: 2 }}>Search Filters</Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Date Range</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <SingleDatePicker
                                    label="Start Date"
                                    initialDate="1900-01-01"
                                    onChange={(date) => handleInputChange('StartDate', { value: date })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <SingleDatePicker
                                    label="End Date"
                                    initialDate={dayjs().format('YYYY-MM-DD')}
                                    onChange={(date) => handleInputChange('EndDate', { value: date })}
                                />
                            </Grid>
                        </Grid>

                        <NutritionFilter value={searchInputs.Nutrition} onChange={handleNutritionChange} />

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Allergens</Typography>
                            <TextField
                                fullWidth
                                label="Allergens (Text Search)"
                                placeholder="e.g. Peanuts, Soy"
                                value={searchInputs.Allergens}
                                onChange={handleTextFieldChange('Allergens')}
                                variant="outlined"
                                helperText="Searches 'Contains' and 'May Contain'"
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', bgcolor: '#f5f5f5', p: 3, borderRadius: 2 }}>
                    <Button variant="contained" size="large" onClick={() => handleSearch(0, rowsPerPage)} disabled={isLoading}>
                        Search
                    </Button>
                    <ResetButton onClick={handleReset} />
                    <DownloadResultButton queryBody={currentQueryBody} totalProducts={totalProducts} />
                </Box>

                <SearchResultSummary totalProducts={totalProducts} />
                
                <Box sx={{ mt: 2 }}>
                    <ColumnSelection
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        columnsVisibility={columnsVisibility}
                        handleColumnSelection={handleColumnSelection}
                    />
                    {isLoading ? <Typography sx={{ p: 4, textAlign: 'center' }}>Loading...</Typography> : (
                        <ToolTable 
                            columns={selectedColumns}
                            data={searchResults}
                            totalCount={totalProducts}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                        />
                    )}
                </Box>
            </div>
        </PageContainer>
    );
};

export default AdvancedSearch;