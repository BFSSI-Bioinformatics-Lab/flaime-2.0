import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography, Divider, Grid, 
  Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Select, MenuItem, Checkbox, 
  ListItemText } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import { useSearchFilters, buildFilterClauses, buildTextMustClauses, getFieldKey } from '../util';
import { StyledTableCell } from './styles';
import { ResetButton } from '../../../components/buttons';
import { Link } from 'react-router-dom';

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
  const [totalProducts, setTotalProducts] = useState(0);
  

  const [columnsVisibility, setColumnsVisibility] = useState({
    id: true,
    name: true,
    price: true,
    source: true,
    store: true,
    date: true,
    region: true,
    category: true,
  });

  const [selectedColumns, setSelectedColumns] = useState(Object.keys(columnsVisibility));

  const handleColumnSelection = (event) => {
    setSelectedColumns(event.target.value);
  };

  // Reset button 
  const handleReset = () => {
    handleInputChange('TextEntries', { value: [] });
    handleInputChange('Source', { value: null });
    handleInputChange('Store', { value: null });
    handleInputChange('Region', { value: null });
    handleInputChange('StartDate', { value: '1900-01-01' }); 
    handleInputChange('EndDate', { value: dayjs().format('YYYY-MM-DD') });
    setSearchResults([]);
    setInputMode('Names');
    setTotalProducts(0); // Reset totalProducts to 0
  };

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
        size: 10000,
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
            setTotalProducts(data.hits.total.value);
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
console.log(searchResults);


return (
  <PageContainer>
    <div>
      <Typography variant="h4" style={{ padding: '10px' }}>Product Finder</Typography>
      <Typography variant="body1" style={{ padding: '10px', width: '80vw', margin: '0 auto' }}>
        Here you can enter a list of product names or FLAIME IDs to search for. <br/> You can also further filter by source, region, and store. 
      </Typography>
      <Divider style={{ width: '60vw', margin: '15px auto 15px auto' }}/>
      <FormControl style={{ margin: '0 25%' }}>
        <RadioGroup row value={inputMode} onChange={handleInputModeChange} name="inputMode">
          <FormControlLabel value="Name" control={<Radio />} label="Product Names" />
          <FormControlLabel value="ID" control={<Radio />} label="FLAIME ID" />
          <FormControlLabel value="UPC" control={<Radio />} label="UPC" />
          <FormControlLabel value="Nielsen_UPC" control={<Radio />} label="Nielsen UPC" />
        </RadioGroup>
      </FormControl>
      <Divider style={{ width: '60vw', margin: '15px auto 5px auto' }}/>
      
      <div style={{ width: '75vw', margin: '10px auto'}}>
        <Typography variant="h5">Enter product names (or IDs) or upload a file</Typography>
        <TextFileInput 
          text={searchInputs.TextEntries.value.join("\n")}
          onTextChange={handleTextChange}
        />
      </div>
      <Divider style={{ width: '60vw', margin: '15px auto 5px auto' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '25px' }}>
        <SourceSelector onSelect={handleSourceChange} />
        <RegionSelector onSelect={handleRegionChange} />
        <StoreSelector onSelect={handleStoreChange} />
      </div>
      
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

      
      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <ResetButton  variant="contained" onClick={handleReset}>Reset Search</ResetButton>
      </div>

      {totalProducts !== 0 && (
        <Divider style={{ marginTop: '20px', color: '#424242', marginBottom: '15px' }}> 
          Based on your search, there is a total of {totalProducts === 1 ? `${totalProducts} product.` : `${totalProducts === 10000 ? "over 10,000" : totalProducts} products.`}
        </Divider>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <Select
          multiple
          value={selectedColumns}
          onChange={handleColumnSelection}
          renderValue={() => 'Select Visible Table Columns'}
          
        >
          {Object.keys(columnsVisibility).map((column) => (
            <MenuItem key={column} value={column}>
              <Checkbox checked={selectedColumns.indexOf(column) > -1} />
              <ListItemText primary={column} />
            </MenuItem>
          ))}
        </Select>
      </div>

      {searchResultsIsLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ height: '500px', overflow: 'auto', marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
              {selectedColumns.map((column) => (
                <StyledTableCell key={column}>{column}</StyledTableCell>
              ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {searchResults.map((item, index) => (
                <TableRow key={index}>
                  {selectedColumns.map((column) => (
                    <TableCell key={column}>
                      {column === 'id' && <Link to={`/tools/product-browser/${item._id}`} target="_blank">{item._id}</Link>}
                      {column === 'name' && <span>{item._source.site_name}</span>}
                      {column === 'price' && <span>{item._source.reading_price}</span>}
                      {column === 'source' && <span>{item._source.sources.name}</span>}
                      {column === 'store' && <span>{item._source.stores.name}</span>}
                      {column === 'date' && <span>{item._source.scrape_batches.scrape_datetime}</span>}
                      {column === 'region' && <span>{item._source.scrape_batches.region}</span>}
                      {column === 'category' && <span>{item._source.categories ? item._source.categories.map(cat => cat.name).join(", ") : 'No category'}</span>}
                    </TableCell>
                  ))}
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
      
        </div>
        
      )}
    </div>
    </PageContainer>
  );
};

export default ProductFinder;
