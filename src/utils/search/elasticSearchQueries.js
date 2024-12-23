// utils/search/elasticSearchQueries.js
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
  
    
    try {
      if (searchInputs.Source && searchInputs.Source.value !== null) {
        filters.push({
          term: {
            "source.id": parseInt(searchInputs.Source.value, 10)
          }
        });
      }
      
      if (searchInputs.Store && searchInputs.Store.value !== null) {
        filters.push({
          term: {
            "store.id": parseInt(searchInputs.Store.value, 10)
          }
        });
      }
      
      if (searchInputs.Region && searchInputs.Region.value !== null) {
        filters.push({
          term: {
            "scrape_batch.region.keyword": searchInputs.Region.value
          }
        });
      }
  
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
    return filters;
  };