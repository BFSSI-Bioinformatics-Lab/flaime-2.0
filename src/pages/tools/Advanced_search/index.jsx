import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import { useSearchFilters, buildTextMustClauses, buildFilterClauses, getFieldKey } from '../util';

const AdvancedSearch = () => {
    const initialFilters = {
        TextEntries: { value: [] },
        Source: { value: null },
        Store: { value: null },
        Region: { value: null },
        StartDate: { value: null },
        EndDate: { value: null }
    };

    const [inputMode, setInputMode] = useState('Name');
    const [searchInputs, handleInputChange] = useSearchFilters(initialFilters);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        const fieldKey = getFieldKey(inputMode);
        const textQueries = buildTextMustClauses(searchInputs.TextEntries, fieldKey);
        const filters = buildFilterClauses(searchInputs);

        const queryBody = {
            from: 0,
            size: 100,
            query: {
                bool: {
                    must: textQueries,
                    filter: filters
                }
            }
        };

        console.log("Query Body:", JSON.stringify(queryBody, null, 2));

        // Simulate fetching data
        setTimeout(() => {
            setIsLoading(false);
            setSearchResults([]); // Simulate search results
        }, 1000);
    };

    const handleSelectorChange = (field) => (value) => {
        handleInputChange(field, { value: value === '-1' ? null : value });
    };

    return (
        <div>
            <FormControl>
                <RadioGroup row value={inputMode} onChange={e => setInputMode(e.target.value)} name="inputMode">
                    <FormControlLabel value="Name" control={<Radio />} label="Product Names" />
                    <FormControlLabel value="ID" control={<Radio />} label="Product IDs" />
                    <FormControlLabel value="UPC" control={<Radio />} label="UPC" />
                    <FormControlLabel value="Nielsen_UPC" control={<Radio />} label="Nielsen UPC" />
                </RadioGroup>
            </FormControl>
            <h2>Enter search terms:</h2>
            <TextFileInput
                text={searchInputs.TextEntries.value.join("\n")}
                onTextChange={(text) => handleInputChange('TextEntries', { value: text.split("\n").filter(line => line.trim() !== "") })}
            />
            <SourceSelector onSelect={handleSelectorChange('Source')} />
            <RegionSelector onSelect={handleSelectorChange('Region')} />
            <StoreSelector onSelect={handleSelectorChange('Store')} />
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
                    <h2>Results:</h2>
                    {/* Placeholder for search results */}
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;
