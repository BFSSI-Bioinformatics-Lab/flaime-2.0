// advanced_search.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { TextField, Button, Alert, Typography, Divider, Grid } from '@mui/material';
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
import { ResetButton } from '../../../components/buttons';

const AdvancedSearch = () => {
    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page when the component mounts
    }, []);
    
    const initialFilters = {
        Names: '',
        IDs: '',
        UPCs: '',
        NielsenUPCs: '',
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
    // for pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [columnsVisibility, setColumnsVisibility] = useState({
        id: true,
        name: true,
        price: true,
        source: true,
        store: true,
        date: true,
        region: true,
        category: true,
        subcategory: true,
      });
    
      const [selectedColumns, setSelectedColumns] = useState(Object.keys(columnsVisibility));

      const handleReset = () => {
        handleInputChange('Names', '');
        handleInputChange('IDs', '');
        handleInputChange('UPCs', '');
        handleInputChange('NielsenUPCs', '');
        handleInputChange('Nutrition', {
            nutrient: '',
            minAmount: '',
            maxAmount: ''
        });
        setSearchResults([]);
        setIsLoading(false);
        setTotalProducts(0);
    };
    
      const handleColumnSelection = (event) => {
        setSelectedColumns(event.target.value);
      };


    const handleTextFieldChange = (field) => (event) => {
        handleInputChange(field, event.target.value);
        if (errorMessage) setErrorMessage('');
    };
    
    const handleSearch = async () => {
        setIsLoading(true);
        
        // Collecting base queries that aren't related to nutrients
        const textMustClauses = buildTextMustClausesForAllFields(searchInputs);
        
        // Initialize the nutrient query
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
        
        // Add nutrient ID condition if specified
        if (searchInputs.Nutrition.nutrient) {
            nutrientQuery.nested.query.bool.must.push({
            term: {
                "nutrition_details.nutrient_id": searchInputs.Nutrition.nutrient
            }
            });
        }
        
        // Add range conditions for amount if specified
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
        
        // Combining all must clauses including nutrient query if any conditions were added
        const finalQuery = {
            from: page * rowsPerPage,
            size: rowsPerPage,
            query: {
              bool: {
                must: [
                  ...textMustClauses,
                  ...(nutrientQuery.nested.query.bool.must.length > 0 ? [nutrientQuery] : [])
                ]
              }
            }
          };
              
        console.log("Query Body:", JSON.stringify(finalQuery, null, 2));
        
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
                    <SourceSelector onSelect={handleSelectorChange('Source') } showTitle={true} label="Select a source" />
                    <RegionSelector onSelect={handleSelectorChange('Region')} />
                    <StoreSelector onSelect={handleSelectorChange('Store')} />
                </div>

                <Grid container spacing={1} direction="row" justifyContent="space-between" >
                    <Grid item xs={12} md={6}>
                        <CategorySelector onChange={handleCategoryChange('Categories')} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" style={{ padding: '10px 20px 20px 20px' }}>Select a date range</Typography>
                        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 20px' }}>
                            
                            <SingleDatePicker
                                label="Start Date"
                                initialDate="1900-01-01"
                                onChange={(date) => handleInputChange('StartDate', { value: date })}
                            />
                            <SingleDatePicker
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
                
                <div style={{ marginTop: '20px' }}>
                    <Button variant="contained" onClick={handleSearch} disabled={isLoading} >
                        Search
                    </Button>
                    <ResetButton  variant="contained" onClick={handleReset}>Reset Search</ResetButton>
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
