// advanced_search.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { TextField, Button, Alert, MenuItem, Typography, Divider } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import CategorySelector from '../../../components/inputs/CategorySelector';
import NutritionFilter from '../../../components/inputs/NutritionFilter';
import { useSearchFilters, buildTextMustClausesForAllFields } from '../util';

const AdvancedSearch = () => {
    const initialFilters = {
        Names: '',
        IDs: '',
        UPCs: '',
        NielsenUPCs: '',
        Subcategories: { value: [] },
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


    const handleTextFieldChange = (field) => (event) => {
        handleInputChange(field, event.target.value);
        if (errorMessage) setErrorMessage('');
    };
    
    const handleSearch = async () => {
        // make them enter something, anything
        // if (!searchInputs.Names && !searchInputs.IDs && !searchInputs.UPCs && !searchInputs.NielsenUPCs) {
        //     setErrorMessage('Please enter at least one search criterion in the text fields.');
        //     return;
        // }
        setIsLoading(true);

        // Collecting base queries that aren't related to nutrients
        const textMustClauses = buildTextMustClausesForAllFields(searchInputs);

        // Initialize an array to hold all parts of the nutrient query
        let nutrientQueries = [];
    
        if (searchInputs.Nutrition.nutrient) {
            // This nested query is for matching the nutrient ID inside the nutrients nested structure
            nutrientQueries.push({
                nested: {
                    path: "store_product_nutrition_facts.nutrients",
                    query: {
                        bool: {
                            must: [
                                {
                                    match: {
                                        "store_product_nutrition_facts.nutrients.id": searchInputs.Nutrition.nutrient
                                    }
                                }
                            ]
                        }
                    }
                }
            });
        }
    
        // Conditionally adding range queries for nutrient amounts if specified
        if (searchInputs.Nutrition.minAmount) {
            nutrientQueries.push({
                range: {
                    "store_product_nutrition_facts.amount": {
                        gte: parseFloat(searchInputs.Nutrition.minAmount) // Ensure input is treated as a number
                    }
                }
            });
        }
    
        if (searchInputs.Nutrition.maxAmount) {
            nutrientQueries.push({
                range: {
                    "store_product_nutrition_facts.amount": {
                        lte: parseFloat(searchInputs.Nutrition.maxAmount) // Ensure input is treated as a number
                    }
                }
            });
        }
    
        // Combining all must clauses including nutrient queries if any
        const finalQuery = {
            from: 0,
            size: 100,
            query: {
                bool: {
                    must: [
                        ...textMustClauses,
                        {
                            nested: {
                                path: "store_product_nutrition_facts",
                                query: {
                                    bool: {
                                        must: nutrientQueries
                                    }
                                }
                            }
                        }
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
    
            // Log response from Elasticsearch
            console.log("Elasticsearch response:", JSON.stringify(data, null, 2));
    
            if (response.ok) {
                console.log("Search successful, hits:", data.hits.hits.length);
                setSearchResults(data.hits.hits);
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

    return (
        <PageContainer>
            <div>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                <Typography variant="h4" style={{ padding: '10px' }}>Advanced Search</Typography>
                <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
                Enter search terms in any or all of the fields.
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
                <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' }}>
                    <SourceSelector onSelect={handleSelectorChange('Source')} />
                    <RegionSelector onSelect={handleSelectorChange('Region')} />
                    <StoreSelector onSelect={handleSelectorChange('Store')} />
                </div>

                <CategorySelector onChange={handleCategoryChange('Subcategories')} />
                
                <div>
                    <h2>Select a date range</h2>
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
                <NutritionFilter
                    value={searchInputs.Nutrition}
                    onChange={handleNutritionChange}
                />
                <div>
                    <Button variant="contained" onClick={handleSearch} disabled={isLoading} style={{ marginTop: '20px' }}>
                        Search
                    </Button>
                </div>
                {isLoading ? <p>Loading...</p> : (
                    <div>
                        <table>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Source</th>
                            <th>Store</th>
                            <th>Date</th>
                            <th>Region</th>
                            <th>Category</th>
                            <th>Subcategory</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map((item, index) => (
                            <tr key={index}>
                                <td>{item._id}</td>
                                <td>{item._source.site_name}</td>
                                <td>{item._source.reading_price}</td>
                                <td>{item._source.sources.name}</td>
                                <td>{item._source.stores.name}</td>
                                <td>{item._source.scrape_batches.scrape_datetime}</td>
                                <td>{item._source.scrape_batches.region}</td>
                                <td>
                                {item && item._source && item._source.categories && Array.isArray(item._source.categories)
                                    ? item._source.categories
                                        .map(cat => cat ? cat.name : undefined) 
                                        .filter(name => name)
                                        .join(", ") || 'No category'
                                    : 'No category'
                                }
                                </td>
                                <td>
                                {item && item._source && item._source.subcategories && Array.isArray(item._source.subcategories)
                                    ? item._source.subcategories
                                        .map(subcat => subcat ? subcat.name : undefined) 
                                        .filter(name => name)
                                        .join(", ") || 'No subcategory'
                                    : 'No subcategory'
                                }
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default AdvancedSearch;
