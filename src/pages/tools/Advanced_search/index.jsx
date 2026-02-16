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

const STORAGE_OPTIONS = [
    { value: 'shelf_stable', label: 'Shelf Stable' },
    { value: 'fridge', label: 'Fridge' },
    { value: 'freezer', label: 'Freezer' },
];

const PACKAGING_OPTIONS = [
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal' },
    { value: 'paper', label: 'Paper/Cardboard' },
    { value: 'plastic', label: 'Plastic' },
];

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
            <div>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                <Typography variant="h4" style={{ padding: '10px' }}>Advanced Search</Typography>
                <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
                Enter search terms in any or all of the fields. Note that some fields are only relevant for certain datasets; e.g. Region is only relevant for Web Scrape data, and Store is not recorded for Nielsen data.
                </Typography>
                <Divider style={{ width: '60vw', margin: '15px auto 5px auto' }}/>
                <Typography variant="h5" style={{ padding: '10px' }}>Product Info</Typography>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '15px' }}>
                    <div style={{ maxWidth: '320px', minWidth: '280px' }}>
                        <TextField
                            label="Product Name"
                            value={searchInputs.Names}
                            onChange={handleTextFieldChange('Names')}
                            variant="outlined"
                            InputProps={{ style: { minWidth: '280px', overflow: 'hidden' } }}
                        />
                    </div>
                    <div>
                        <TextField
                            label="Product ID"
                            value={searchInputs.IDs}
                            onChange={handleTextFieldChange('IDs')}
                            variant="outlined"
                        />
                    </div>
                    <div>
                        <TextField
                            label="External ID"
                            value={searchInputs.ExternalIDs}
                            onChange={handleTextFieldChange('ExternalIDs')}
                            variant="outlined"
                        />
                    </div>
                    <div>
                        <TextField
                            label="UPC"
                            value={searchInputs.UPCs}
                            onChange={handleTextFieldChange('UPCs')}
                            variant="outlined"
                        />
                    </div>
                    <div>
                        <TextField
                            label="Nielsen UPC"
                            value={searchInputs.NielsenUPCs}
                            onChange={handleTextFieldChange('NielsenUPCs')}
                            variant="outlined"
                        />
                    </div>
                </div>

                <Divider style={{ width: '60vw', margin: '10px auto' }}/>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '25px' }}>
                    <SourceSelector 
                        value={searchInputs.Source.value} 
                        onSelect={handleSelectorChange('Source')} 
                        showTitle={true} 
                        label="Select a source" 
                    />
                    <RegionSelector 
                        value={searchInputs.Region.value} 
                        onSelect={handleSelectorChange('Region')} 
                    />
                    <StoreSelector 
                        value={searchInputs.Store.value} 
                        onSelect={handleSelectorChange('Store')} 
                    />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '25px' }}>
                    
                    <FormControl variant="outlined" style={{ minWidth: 250 }}>
                        <InputLabel>Storage Condition</InputLabel>
                        <Select
                            value={searchInputs.Storage}
                            onChange={handleSelectChange('Storage')}
                            label="Storage Condition"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {STORAGE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" style={{ minWidth: 250 }}>
                        <InputLabel>Packaging Material</InputLabel>
                        <Select
                            value={searchInputs.Packaging}
                            onChange={handleSelectChange('Packaging')}
                            label="Packaging Material"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {PACKAGING_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <div style={{ minWidth: '250px' }}>
                        <TextField
                            label="Allergens (Text Search)"
                            placeholder="e.g. Peanuts, Soy"
                            value={searchInputs.Allergens}
                            onChange={handleTextFieldChange('Allergens')}
                            variant="outlined"
                            fullWidth
                            helperText="Searches 'Contains' and 'May Contain'"
                        />
                    </div>
               </div>

                <Grid container spacing={1} direction="row" justifyContent="space-between" >
                    <Grid item xs={12} md={6}>
                        <CategorySelector key={resetKey} onChange={handleCategoryChange('Categories')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" style={{ padding: '10px 20px 20px 20px' }}>Select a date range</Typography>
                        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 20px' }}>
                            
                            <SingleDatePicker
                                key={`start-${resetKey}`}
                                label="Start Date"
                                initialDate="1900-01-01"
                                onChange={(date) => handleInputChange('StartDate', { value: date })}
                            />
                            <SingleDatePicker
                                key={`end-${resetKey}`}
                                label="End Date"
                                initialDate={dayjs().format('YYYY-MM-DD')}
                                onChange={(date) => handleInputChange('EndDate', { value: date })}
                            />
                        </div>
                        <Divider style={{ width: '300px', margin: '10px auto' }}/>
                        <div>
                            <NutritionFilter
                                value={searchInputs.Nutrition}
                                onChange={handleNutritionChange}
                            />
                        </div>
                    </Grid>
                </Grid>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <Button variant="contained" onClick={() => handleSearch(0, rowsPerPage)} disabled={isLoading} >
                        Search
                    </Button>
                    <ResetButton  variant="contained" onClick={handleReset}>Reset Search</ResetButton>
                    <DownloadResultButton 
                        queryBody={currentQueryBody} 
                        totalProducts={totalProducts} 
                        fileNamePrefix="advanced_search" 
                    />
                </div>
                <SearchResultSummary totalProducts={totalProducts} />
                <>
                    <ColumnSelection
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        columnsVisibility={columnsVisibility}
                        handleColumnSelection={handleColumnSelection}
                    />
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
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
                </>
            </div>
        </PageContainer>
    );
};

export default AdvancedSearch;