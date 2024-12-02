import { ApiInstance } from '../Api';
import { buildTextMustClausesForAllFields } from '../../utils';

class ExportService {
  static async exportProducts({
    format,
    columns,
    filters
  }) {
    try {
      if (format === 'csv') {
        // Build and execute query
        const textMustClauses = buildTextMustClausesForAllFields(filters);
        const nutrientQuery = buildNutrientQuery(filters.nutrition);
        
        const finalQuery = {
          size: 10000,
          query: {
            bool: {
              must: [
                ...textMustClauses,
                ...(nutrientQuery ? [nutrientQuery] : [])
              ]
            }
          }
        };

        const response = await fetch(`${process.env.REACT_APP_ELASTIC_URL}/_search`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(finalQuery)
        });

        const data = await response.json();
        const results = data.hits.hits;

        // Format the data
        const headers = columns.map(col => col.headerName).join(',');
        const rows = results.map(item => 
          columns.map(col => {
            let value = '';
            switch (col.field) {
              case 'id':
                value = item._id;
                break;
              case 'name':
                value = item._source.site_name;
                break;
              case 'price':
                value = item._source.reading_price;
                break;
              case 'source':
                value = item._source.source?.name;
                break;
              case 'store':
                value = item._source.store?.name;
                break;
              case 'date':
                value = item._source.scrape_batch?.datetime;
                break;
              case 'region':
                value = item._source.scrape_batch?.region;
                break;
              case 'category':
                value = item._source.category || 'No category';
                break;
              case 'subcategory':
                value = item._source.subcategory || 'No subcategory';
                break;
              default:
                value = item._source[col.field] || '';
            }
            return value ? `"${value.toString().replace(/"/g, '""')}"` : '';
          }).join(',')
        );
        
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.href = url;
        link.setAttribute('download', `product-export-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
      }
      
      // ... rest of the service code ...
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

const buildNutrientQuery = (nutrition) => {
  if (!nutrition) return null;
  
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

  if (nutrition.nutrientId) {
    query.nested.query.bool.must.push({
      term: {
        "nutrition_details.nutrient_id": nutrition.nutrientId
      }
    });
  }

  if (nutrition.minAmount || nutrition.maxAmount) {
    const amountRange = {};
    if (nutrition.minAmount) amountRange.gte = parseFloat(nutrition.minAmount);
    if (nutrition.maxAmount) amountRange.lte = parseFloat(nutrition.maxAmount);
    
    query.nested.query.bool.must.push({
      range: {
        "nutrition_details.amount": amountRange
      }
    });
  }

  return query;
};

export default ExportService;