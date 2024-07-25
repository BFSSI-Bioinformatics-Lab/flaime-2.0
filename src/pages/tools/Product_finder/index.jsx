import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography, Divider, TablePagination } from '@mui/material';
import PageContainer from '../../../components/page/PageContainer';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import { useSearchFilters, buildFilterClauses, buildTextMustClauses, getFieldKey } from '../util';
import { ResetButton } from '../../../components/buttons';
import ColumnSelection  from '../../../components/table/ColumnSelection';
import ToolTable  from '../../../components/table/ToolTable';
import SearchResultSummary from '../../../components/misc/SearchResultSummary';


const ProductFinder = () => {
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
  const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);
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
    setInputMode('Name');
    setTotalProducts(0); // Reset totalProducts to 0
    handlePageChange(0); // reset pagination
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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    handleSearch(newPage + 1, rowsPerPage);  // Add 1 because Elasticsearch uses 1-indexed pages
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    handleSearch(0, newRowsPerPage);
};

  
  const handleSearch = async (newPage = 1) => {
    setSearchResultsIsLoading(true);
    console.log("Starting search with input mode:", inputMode);
    console.log("Search filters:", searchInputs);

    const filters = buildFilterClauses(searchInputs);
    const fieldKey = getFieldKey(inputMode);
    const textQueries = buildTextMustClauses(searchInputs.TextEntries, fieldKey);

    const queryBody = {
      from: (newPage - 1) * rowsPerPage,
      size: rowsPerPage,
      query: {
        bool: {
          must: textQueries,
          filter: filters
        }
      }
    };
    
    console.log("filters:", filters);
    console.log("fieldKey:", fieldKey);
    console.log("textQueries:", JSON.stringify(textQueries, null, 2));
    console.log("Elasticsearch query body:", JSON.stringify(queryBody, null, 2));
  
    const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
  
    try {
      const response = await fetch(elastic_url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(queryBody)
      });
  
      const data = await response.json();
      console.log("Elasticsearch response:", JSON.stringify(data, null, 2));
  
      if (response.ok) {
        console.log("Search successful, hits:", data.hits.total.value);
        if (response.ok) {
          setSearchResults(data.hits.hits);
          setTotalProducts(data.hits.total.value);
          setPage(newPage - 1);  // Subtract 1 to convert to 0-indexed for Material-UI
        }
      } else {
        console.error('Search API error:', data.error || data);
        setSearchResults([]);
        setTotalProducts(0);
        setPage(0);
      }
    } catch (error) {
      console.error('Search request failed:', error);
      setSearchResults([]);
      setTotalProducts(0);
      setPage(0);
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
      
      <Typography variant="h5">Select a date range</Typography>
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '15px 0', width: '45vw' }}>
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
        <Button variant="contained" onClick={() => handleSearch(1)}>
          Search
        </Button>
        <ResetButton variant="contained" onClick={handleReset}>Reset Search</ResetButton>
      </div>
      <SearchResultSummary totalProducts={totalProducts} />
      <>
        <ColumnSelection
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          columnsVisibility={columnsVisibility}
          handleColumnSelection={handleColumnSelection}
        />
        {searchResultsIsLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <ToolTable 
              columns={selectedColumns}
              data={searchResults}
              totalCount={totalProducts}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </>
      </div>
    </PageContainer>
  );
};

export default ProductFinder;
