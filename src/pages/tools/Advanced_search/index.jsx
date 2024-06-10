import React, { useState } from 'react';
import TextFileInput from '../../../components/inputs/TextFileInput';
import StoreSelector from '../../../components/inputs/StoreSelector';
import SourceSelector from '../../../components/inputs/SourceSelector';
import CategorySelector from '../../../components/inputs/CategorySelector';
import { Button } from '@mui/material';

const AdvancedSearch = () => {
  const [searchInputs, setSearchInputs] = useState({
    Names: {
      value: []
    },
    Categories: {
      value: new Set()
    },
    SubCategories: {
        value: new Set()
      },
    Sources: {
      value: null
    },
    Stores: {
      value: null
    }
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsIsLoading, setSearchResultsIsLoading] = useState(false);

  const handleTextChange = (newText) => {
    setSearchInputs(prev => ({
      ...prev,
      Names: {
        value: newText.split("\n").filter(line => line.trim() !== "")
      }
    }));
    console.log("Updated Names:", newText);
  };

  const handleSourceChange = (selectedSource) => {
    setSearchInputs(prev => ({
      ...prev,
      Sources: {
        value: selectedSource
      }
    }));
    console.log("Selected Source:", selectedSource);
  };

  const handleStoreChange = (selectedStore) => {
    setSearchInputs(prev => ({
      ...prev,
      Stores: {
        value: selectedStore
      }
    }));
    console.log("Selected Store:", selectedStore);
  };

  const handleCategoryChange = (selectedCategories) => {
    setSearchInputs(prev => ({
      ...prev,
      Categories: {
        value: new Set(selectedCategories)
      }
    }));
    console.log("Selected Categories:", selectedCategories);
  };

  const handleSearch = async () => {
    setSearchResultsIsLoading(true);
    console.log("Starting search with filters:", searchInputs);

    const filters = [];

    if (searchInputs.Sources.value) {
        filters.push({
            term: {
                "sources.id": parseInt(searchInputs.Sources.value, 10)
            }
        });
    }

    if (searchInputs.Stores.value) {
        filters.push({
            term: {
                "stores.id": parseInt(searchInputs.Stores.value, 10)
            }
        });
    }

    const queryBody = {
        from: 0,
        size: 10,
        query: {
            bool: {
                must: [
                    {
                        match: {
                            "site_name.keyword": searchInputs.Names.value.join(" ")
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
      <TextFileInput 
        text={searchInputs.Names.value.join("\n")}
        onTextChange={handleTextChange}
      />
      <SourceSelector onSelect={handleSourceChange} />
      <StoreSelector onSelect={handleStoreChange} />
      <CategorySelector onChange={handleCategoryChange} />
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
                        <th>Brand</th>
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
                            <td>{item._source.raw_brand}</td>
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

export default AdvancedSearch;

