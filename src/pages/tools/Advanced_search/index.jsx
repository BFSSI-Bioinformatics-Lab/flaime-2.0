import React, { useState } from 'react';
import dayjs from 'dayjs';
import { TextField, Button, Alert } from '@mui/material';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import CategorySelector from '../../../components/inputs/CategorySelector';
import { useSearchFilters, buildTextMustClausesForAllFields, buildFilterClauses } from '../util';

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
        EndDate: { value: null }
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
        if (!searchInputs.Names && !searchInputs.IDs && !searchInputs.UPCs && !searchInputs.NielsenUPCs) {
            setErrorMessage('Please enter at least one search criterion in the text fields.');
            return;
        }
        setIsLoading(true);
    
        const filters = buildFilterClauses(searchInputs);
        const mustClauses = buildTextMustClausesForAllFields(searchInputs);
    
        const queryBody = {
            from: 0,
            size: 100,
            query: {
                bool: {
                    must: mustClauses,
                    filter: filters
                }
            }
        };
    
        console.log("Query Body:", JSON.stringify(queryBody, null, 2));

        const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
        try {
            const response = await fetch(elastic_url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(queryBody)
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

    return (
        <div>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
                label="Product Names"
                value={searchInputs.Names}
                onChange={handleTextFieldChange('Names')}
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <TextField
                label="Product IDs"
                value={searchInputs.IDs}
                onChange={handleTextFieldChange('IDs')}
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <TextField
                label="UPC"
                value={searchInputs.UPCs}
                onChange={handleTextFieldChange('UPCs')}
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <TextField
                label="Nielsen UPC"
                value={searchInputs.NielsenUPCs}
                onChange={handleTextFieldChange('NielsenUPCs')}
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <SourceSelector onSelect={handleSelectorChange('Source')} />
            <RegionSelector onSelect={handleSelectorChange('Region')} />
            <StoreSelector onSelect={handleSelectorChange('Store')} />
            <CategorySelector onChange={handleCategoryChange('Subcategories')} />
            <h2>Select a date range:</h2>
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
            <Button variant="contained" onClick={handleSearch} disabled={isLoading} style={{ marginTop: '20px' }}>
                Search
            </Button>
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
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
