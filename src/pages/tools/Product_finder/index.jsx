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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
const displayedResults = searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

      <div>
      
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
      <Button variant="contained" onClick={handleSearch} style={{ marginTop: '20px' }}>
        Search
      </Button>
      {searchResultsIsLoading ? (
        <p>Loading...</p>
      ) : (
        <>
      <Table>
        <TableHead>
          <TableRow>
          {selectedColumns.map((column) => (
            <TableCell key={column}>{column}</TableCell>
          ))}
            {/* <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Store</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Category</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedResults.map((item, index) => (
            <TableRow key={index}>
              {selectedColumns.map((column) => (
                <TableCell key={column}>
                  {column === 'id' && <span>{item._id}</span>}
                  {column === 'name' && <span>{item._source.site_name}</span>}
                  {column === 'price' && <span>{item._source.reading_price}</span>}
                  {column === 'source' && <span>{item._source.sources.name}</span>}
                  {column === 'store' && <span>{item._source.stores.name}</span>}
                  {column === 'date' && <span>{item._source.scrape_batches.scrape_datetime}</span>}
                  {column === 'region' && <span>{item._source.scrape_batches.region}</span>}
                  {column === 'category' && <span>{item._source.categories ? item._source.categories.map(cat => cat.name).join(", ") : 'No category'}</span>}
                </TableCell>
              ))}
              {/* <TableCell>{item._id}</TableCell>
              <TableCell>{item._source.site_name}</TableCell>
              <TableCell>{item._source.reading_price}</TableCell>
              <TableCell>{item._source.sources.name}</TableCell>
              <TableCell>{item._source.stores.name}</TableCell>
              <TableCell>{item._source.scrape_batches.scrape_datetime}</TableCell>
              <TableCell>{item._source.scrape_batches.region}</TableCell>
              <TableCell>
                {item._source.categories ? item._source.categories.map(cat => cat.name).join(", ") : 'No category'}
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={searchResults.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </>
        
      )}
    </div>
    </PageContainer>
  );
};

export default ProductFinder;
