import { useState } from 'react';

export const useSearchFilters = (initialFilters) => {
  const [searchInputs, setSearchInputs] = useState(initialFilters);

  const handleInputChange = (field, value) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return [searchInputs, handleInputChange];
};

export const buildTextMustClauses = (textEntries, fieldKey) => {
    return [{
        bool: {
            should: textEntries.value.map(entry => ({
                term: {
                    [fieldKey]: entry
                }
            })),
            minimum_should_match: 1
        }
    }];
};

export const buildTextMustClausesForAllFields = (searchInputs) => {
    const mustClauses = [];

    if (searchInputs.Names) {
        mustClauses.push({
            wildcard: {
                "site_name": {
                    value: `*${searchInputs.Names}*`
                }
            }
        });
    }
    if (searchInputs.IDs) {
        mustClauses.push({ term: { "id": searchInputs.IDs } });
    }
    if (searchInputs.ExternalIDs) {
        mustClauses.push({ term: { "external_id": searchInputs.ExternalIDs } });
    }
    if (searchInputs.UPCs) {
        mustClauses.push({ term: { "raw_upc.keyword": searchInputs.UPCs } });
    }
    if (searchInputs.NielsenUPCs) {
        mustClauses.push({ term: { "nielsen_upc.keyword": searchInputs.NielsenUPCs } });
    }
    if (searchInputs.Source.value !== null) {
        mustClauses.push({ term: { "source.id": parseInt(searchInputs.Source.value, 10) } });
    }
    if (searchInputs.Store.value !== null) {
        mustClauses.push({ term: { "store.id": parseInt(searchInputs.Store.value, 10) } });
    }
    if (searchInputs.Region.value !== null) {
        mustClauses.push({ term: { "scrape_batch.region.keyword": searchInputs.Region.value } });
    }
    if (searchInputs.Categories.value && searchInputs.Categories.value.length > 0) {
        mustClauses.push({
            nested: {
                path: "categories",
                query: {
                    terms: { "categories.id": searchInputs.Categories.value }
                }
            }
        });
    }
    
    // handle Date filters
    if (searchInputs.StartDate.value && searchInputs.EndDate.value) {
        mustClauses.push({
            range: {
                "scrape_batch.datetime": {
                    gte: searchInputs.StartDate.value,
                    lte: searchInputs.EndDate.value
                }
            }
        });
    } else if (searchInputs.StartDate.value) {
        mustClauses.push({ range: { "scrape_batch.datetime": { gte: searchInputs.StartDate.value } } });
    } else if (searchInputs.EndDate.value) {
        mustClauses.push({ range: { "scrape_batch.datetime": { lte: searchInputs.EndDate.value } } });
    }
    
    return mustClauses;
};

export const buildFilterClauses = (searchInputs) => {
    const filters = [];

    console.log('Building filters with inputs:', searchInputs);
    
    try {
        // Filter by source ID, only if source is not null
        if (searchInputs.Source && searchInputs.Source.value !== null) {
            filters.push({
                term: {
                    "source.id": parseInt(searchInputs.Source.value, 10)
                }
            });
        }
        
        // Filter by store ID, only if store is not null
        if (searchInputs.Store && searchInputs.Store.value !== null) {
            filters.push({
                term: {
                    "store.id": parseInt(searchInputs.Store.value, 10)
                }
            });
        }
        
        // Filter by region keyword, only if region is not null
        if (searchInputs.Region && searchInputs.Region.value !== null) {
            filters.push({
                term: {
                    "scrape_batch.region.keyword": searchInputs.Region.value
                }
            });
        }

        // Filter by categories
        if (searchInputs.Categories && searchInputs.Categories.value && searchInputs.Categories.value.length > 0) {
            filters.push({
                nested: {
                    path: "categories",
                    query: {
                        terms: { "categories.id": searchInputs.Categories.value }
                    }
                }
            });
        }
        
        // Handle date range filters
        const dateFilter = {};
        if (searchInputs.StartDate && searchInputs.StartDate.value && searchInputs.EndDate && searchInputs.EndDate.value) {
            dateFilter.range = {
                "scrape_batch.datetime": {
                    gte: searchInputs.StartDate.value,
                    lte: searchInputs.EndDate.value
                }
            };
        } else if (searchInputs.StartDate && searchInputs.StartDate.value) {
            dateFilter.range = {
                "scrape_batch.datetime": {
                    gte: searchInputs.StartDate.value
                }
            };
        } else if (searchInputs.EndDate && searchInputs.EndDate.value) {
            dateFilter.range = {
                "scrape_batch.datetime": {
                    lte: searchInputs.EndDate.value
                }
            };
        }
        
        if (Object.keys(dateFilter).length !== 0) {
            filters.push(dateFilter);
        }
    } catch(error) {
        console.error('Error building filter clauses:', error);
    }
    console.log('Built filters:', filters);
    return filters;
};

export const getFieldKey = (inputMode) => {
    switch(inputMode) {
        case 'Name':
            return 'site_name.keyword';
        case 'ID':
            return 'id';
        case 'UPC':
            return 'raw_upc.keyword';
        case 'Nielsen_UPC':
            return 'nielsen_upc.keyword';
        default:
            return 'site_name.keyword'; // Default to product names if inputMode is unrecognized
    }
};