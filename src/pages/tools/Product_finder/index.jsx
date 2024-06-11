import React, { useState } from 'react';
import dayjs from 'dayjs';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import RegionSelector from '../../../components/inputs/RegionSelector';
import SingleDatePicker from '../../../components/inputs/SingleDatePicker';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';

const ProductFinder = () => {
  const [inputMode, setInputMode] = useState('Names'); // product name or barcode?
  const [searchInputs, setSearchInputs] = useState({
    TextEntries: {
      value: []
    },
    Source: {
      value: null
    },
    Store: {
      value: null
    },
    Region: {
      value: null
    },
    StartDate: {
      value: null
    },
    EndDate: {
      value: null
    }
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);


  const handleTextChange = (newText) => {
    setSearchInputs(prev => ({
      ...prev,
      TextEntries: {
        value: newText.split("\n").filter(line => line.trim() !== "")
      }
    }));
    console.log(`Updated ${inputMode}:`, newText);
  };

  const handleInputModeChange = (event) => {
    setInputMode(event.target.value);
  };

  const handleSourceChange = (selectedSource) => {
    setSearchInputs(prev => ({
      ...prev,
      Source: {
        value: selectedSource
      }
    }));
    console.log("Selected Source:", selectedSource);
  };

  const handleRegionChange = (selectedRegion) => {
    setSearchInputs(prev => ({
      ...prev,
      Region: {
        value: selectedRegion
      }
    }));
    console.log("Selected Region:", selectedRegion);
  };

  const handleStoreChange = (selectedStore) => {
    setSearchInputs(prev => ({
      ...prev,
      Store: {
        value: selectedStore
      }
    }));
    console.log("Selected Store:", selectedStore);
  };

  const handleStartDateChange = (startDate) => {
    setSearchInputs(prev => ({
      ...prev,
      StartDate: {
        value: startDate
      }
    }));
    console.log("Start Date:", startDate);
  };

  const handleEndDateChange = (endDate) => {
    setSearchInputs(prev => ({
      ...prev,
      EndDate: {
        value: endDate
      }
    }));
    console.log("End Date:", endDate);
  };

  const handleSearch = async () => {
    setSearchResultsIsLoading(true);
    console.log("Starting search with filters:", searchInputs);

    const filters = [];

    if (searchInputs.Source.value) {
        filters.push({
            term: {
                "sources.id": parseInt(searchInputs.Source.value, 10)
            }
        });
    }

    if (searchInputs.Store.value) {
        filters.push({
            term: {
                "stores.id": parseInt(searchInputs.Store.value, 10)
            }
        });
    }

    if (searchInputs.Region.value) {
        filters.push({
            term: {
                "scrape_batches.region.keyword": searchInputs.Region.value
            }
        });
    }

    const dateFilter = {};
    if (searchInputs.StartDate.value && searchInputs.EndDate.value) {
        dateFilter.range = {
            "scrape_batches.scrape_datetime": {
                gte: searchInputs.StartDate.value,
                lte: searchInputs.EndDate.value,
            }
        };
    } else if (searchInputs.StartDate.value) {
        dateFilter.range = {
            "scrape_batches.scrape_datetime": {
                gte: searchInputs.StartDate.value,
            }
        };
    } else if (searchInputs.EndDate.value) {
        dateFilter.range = {
            "scrape_batches.scrape_datetime": {
                lte: searchInputs.EndDate.value,
            }
        };
    }

    if (Object.keys(dateFilter).length !== 0) {
        filters.push(dateFilter);
    }

    const fieldKey = inputMode === 'Names' ? 'site_name.keyword' : 'id';

    const queryBody = {
      from: 0,
      size: 100,
      query: {
          bool: {
              must: [
                  {
                      bool: {
                          should: searchInputs.TextEntries.value.map(entry => ({
                              term: {
                                  [fieldKey]: entry
                              }
                          })),
                          minimum_should_match: 1
                      }
                  }
              ],
              filter: filters
          }
      }
    };
  


    console.log("Elasticsearch query body:", JSON.stringify(queryBody, null, 2));

    const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
    try {
        const response = await fetch( elastic_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryBody)
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (response.ok) {
            console.log("Search results:", data.hits.hits);
            setSearchResults(data.hits.hits);
        } else {
            console.error('Search API error:', data);
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
          <FormControlLabel value="Names" control={<Radio />} label="Product Names" />
          <FormControlLabel value="IDs" control={<Radio />} label="FLAIME IDs" />
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

