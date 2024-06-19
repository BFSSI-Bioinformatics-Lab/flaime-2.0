import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import { useSearchFilters, buildFilterClauses, buildTextMustClauses, getFieldKey } from '../util';

const ProductFinder = () => {
  const initialFilters = {
    TextEntries: { value: [] },
    Source: { value: null },
    Store: { value: null },
    Region: { value: null },
    StartDate: { value: null },
    EndDate: { value: null }
  };

  const [inputMode, setInputMode] = useState('Names');
  const [searchInputs, handleInputChange] = useSearchFilters(initialFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);

  // Handler for changing main input mode (radio buttons)
  const handleInputModeChange = (event) => {
    setInputMode(event.target.value);
  };

  // Handler for changes in text file input
  const handleTextChange = (text) => {
    handleInputChange('TextEntries', { value: text.split("\n").filter(line => line.trim() !== "") });
  };

  // Handlers for selectors
  const handleSourceChange = (selectedSource) => {
      if (selectedSource === '-1') {
          handleInputChange('Source', { value: null });
      } else {
          handleInputChange('Source', { value: selectedSource });
      }
  };
  const handleRegionChange = (selectedRegion) => {
      if (selectedRegion === '-1') {
          handleInputChange('Region', { value: null });
      } else {
          handleInputChange('Region', { value: selectedRegion });
      }
  };
  const handleStoreChange = (selectedStore) => {
      if (selectedStore === '-1') {
          handleInputChange('Store', { value: null });
      } else {
          handleInputChange('Store', { value: selectedStore });
      }
  };

  // Handlers for date pickers
  const handleStartDateChange = (date) => {
    handleInputChange('StartDate', { value: date });
  };
  const handleEndDateChange = (date) => {
    handleInputChange('EndDate', { value: date });
  };

  const handleSearch = async () => {
    setSearchResultsIsLoading(true);

    console.log("Starting search with input mode:", inputMode);
    console.log("Search filters:", searchInputs);

    const filters = buildFilterClauses(searchInputs);
    const fieldKey = getFieldKey(inputMode);
    const textQueries = buildTextMustClauses(searchInputs.TextEntries, fieldKey);

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
    
    console.log("Elasticsearch query body:", JSON.stringify(queryBody, null, 2));

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
    setSearchResultsIsLoading(false);
};

return (
    <div>
      <FormControl>
        <RadioGroup row value={inputMode} onChange={handleInputModeChange} name="inputMode">
          <FormControlLabel value="Name" control={<Radio />} label="Product Names" />
          <FormControlLabel value="ID" control={<Radio />} label="FLAIME ID" />
          <FormControlLabel value="UPC" control={<Radio />} label="UPC" />
          <FormControlLabel value="Nielsen_UPC" control={<Radio />} label="Nielsen UPC" />
        </RadioGroup>
      </FormControl>
      <h2>Enter product names (or IDs) or upload a file</h2>
      <TextFileInput 
        text={searchInputs.TextEntries.value.join("\n")}
        onTextChange={handleTextChange}
      />
      <SourceSelector onSelect={handleSourceChange} />
      <RegionSelector onSelect={handleRegionChange} />
      <StoreSelector onSelect={handleStoreChange} />
      <h2>Select a date range</h2>
      <div>
        <SingleDatePicker 
            label="Start Date"
            initialDate="1900-01-01" // Very old date for start date
            onChange={handleStartDateChange}
        />
        <SingleDatePicker 
            label="End Date"
            initialDate={dayjs().format('YYYY-MM-DD')} // Today's date for end date
            onChange={handleEndDateChange}
        />
      </div>
      <Button variant="contained" onClick={handleSearch} style={{ marginTop: '20px' }}>
        Search
      </Button>
      {searchResultsIsLoading ? (
        <p>Loading...</p>
      ) : (
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
                <td>{item._source.categories ? item._source.categories.map(cat => cat.name).join(", ") : 'No category'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductFinder;
