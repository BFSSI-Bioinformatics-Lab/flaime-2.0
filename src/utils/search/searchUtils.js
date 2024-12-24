// searchUtils.js
import { 
    buildTextMustClauses,
    buildTextMustClausesForAllFields,
    buildFilterClauses 
  } from './elasticSearchQueries';
  
  /**
   * Creates an Elasticsearch query based on provided filters and options
   */
  export const buildElasticsearchQuery = ({
    filters,
    page = 0,
    rowsPerPage = 25,
    options = {}
  }) => {
    const {
      includeNutrition = false,
      textFieldKey = null,
      isExport = false
    } = options;
  
    // Build base query structure
    const query = {
      ...(isExport ? { size: 10000 } : {
        from: page * rowsPerPage,
        size: rowsPerPage
      }),
      query: {
        bool: {
          must: [],
          filter: []
        }
      }
    };
  
    // Use existing text clause builders based on search type
    if (textFieldKey) {
      query.query.bool.must.push(...buildTextMustClauses(filters.TextEntries, textFieldKey));
    } else {
      query.query.bool.must.push(...buildTextMustClausesForAllFields(filters));
    }
  
    // Add filter clauses using existing function
    query.query.bool.filter.push(...buildFilterClauses(filters));
  
    // Add nutrition query if needed
    if (includeNutrition && (filters.Nutrition || filters.nutrition)) {
      const nutrientQuery = buildNutrientQuery(filters.Nutrition || filters.nutrition);
      if (nutrientQuery) {
        query.query.bool.must.push(nutrientQuery);
      }
    }
  
    return query;
  };
  
  /**
   * Builds nutrition query for advanced search
   */
  const buildNutrientQuery = (nutrition) => {
    if (!nutrition || (!nutrition.nutrient && !nutrition.minAmount && !nutrition.maxAmount)) {
      return null;
    }
  
    const query = {
      nested: {
        path: "nutrition_details",
        query: {
          bool: {
            must: []
          }
        }
      }
    };
  
    if (nutrition.nutrient) {
      query.nested.query.bool.must.push({
        term: {
          "nutrition_details.nutrient_id": nutrition.nutrient
        }
      });
    }
  
    const amountRange = {};
    if (nutrition.minAmount) amountRange.gte = parseFloat(nutrition.minAmount);
    if (nutrition.maxAmount) amountRange.lte = parseFloat(nutrition.maxAmount);
    
    if (Object.keys(amountRange).length > 0) {
      query.nested.query.bool.must.push({
        range: {
          "nutrition_details.amount": amountRange
        }
      });
    }
  
    return query;
  };
  
  /**
   * Executes search query against Elasticsearch
   */
  export const executeSearch = async (query) => {
    const elastic_url = `${process.env.REACT_APP_ELASTIC_URL}/_search`;
    
    try {
      const response = await fetch(elastic_url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(query)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      const results = data.hits.hits;
      const total = data.hits.total.value;

      console.log(results);

      return {
        results,
        total
      };
    } catch (error) {
      console.error('Search request failed:', error);
      throw error;
    }
  };