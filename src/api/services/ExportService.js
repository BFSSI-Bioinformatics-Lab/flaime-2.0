// ExportService.js

import { formatProductField, formatNestedFields } from '../../utils';
import { buildElasticsearchQuery, executeSearch } from '../../utils/search/searchUtils';
import { nutrientsList } from '../../components/constants/data/nutrients';
import * as XLSX from 'xlsx';

const ALL_FIELDS = {
  id: "ID",
  raw_upc: "UPC",
  nielsen_upc: "Nielsen UPC",
  store_product_code: "Store Product Code",
  raw_brand: "Brand",
  site_name: "Product Name",
  site_description: "Description",
  raw_serving_size: "Serving Size",
  total_size: "Total Size",
  reading_price: "Price",
  dietary_info_description: "Dietary Info",
  category: "Category",
  subcategory: "Subcategory",
  breadcrumb_array: "Category Path",
  site_url: "Product URL",
  'ingredients.en': "Ingredients (EN)",
  'ingredients.fr': "Ingredients (FR)",
  'source.name': "Source",
  'store.name': "Store",
  'scrape_batch.datetime': "Scrape Date",
  'scrape_batch.region': "Region",
  'scrape_batch.postal_code': "Postal Code",
  most_recent_flag: "Most Recent",
  nutrition_available_flag: "Has Nutrition"
};

const NESTED_FIELDS = {
  categories: {
    path: "categories",
    fields: ["name", "level", "scheme"]
  }
};nutritionDetails

class ExportService {
  static findAvailableNutrients(results) {
    const nutrientIds = new Set();
    results.forEach(item => {
      item.nutrition_details?.forEach(nutrient => {
        nutrientIds.add(nutrient.nutrient_id);
      });
    });
    return Array.from(nutrientIds);
  }

  static getNutrientName(nutrientId) {
    const nutrient = nutrientsList.find(n => n.id === nutrientId);
    return nutrient ? nutrient.name.replace(/,/g, '') : `Nutrient ${nutrientId}`;
  }

  static getAllColumns(availableNutrientIds) {
    const regularColumns = Object.entries(ALL_FIELDS).map(([field, headerName]) => ({
      field,
      headerName,
      isNested: field in NESTED_FIELDS
    }));

    const nutrientColumns = availableNutrientIds.flatMap(nutrientId => [
      {
        field: `nutrition_${nutrientId}_amount`,
        headerName: `${ExportService.getNutrientName(nutrientId)} Amount`,
        isNutrient: true,
        nutrientId,
        valueType: 'amount'
      },
      {
        field: `nutrition_${nutrientId}_dv`,
        headerName: `${ExportService.getNutrientName(nutrientId)} DV%`,
        isNutrient: true,
        nutrientId,
        valueType: 'dv'
      }
    ]);

    return [...regularColumns, ...nutrientColumns];
  }


  static getNutrientValue(nutritionDetails, nutrientId, valueType) {
    const nutrient = nutritionDetails?.find(n => n.nutrient_id === nutrientId);
    if (!nutrient) return '';
    
    if (valueType === 'amount') {
      return nutrient.amount ? `${nutrient.amount}${nutrient.unit}` : '';
    } else if (valueType === 'dv') {
      return nutrient.daily_value || '';
    }
    return '';
  }
  
  static getNestedValue(obj, path) {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== null && value !== undefined ? value : '';
  }

  static async exportProducts({format, type, columns, filters}) {
    try {
      const query = {
        ...buildElasticsearchQuery({
          filters,
          options: {
            includeNutrition: true,
            isExport: true,
            size: format === 'excel' ? 50000 : 100000
          }
        }),
        _source: ["*", "nutrition_details.*"]
      };

      console.log('final query', query);

      let { results } = await executeSearch(query);
      results = results.map(r => r._source);
      
      const availableNutrientIds = ExportService.findAvailableNutrients(results);
      const exportColumns = type === 'all' ? 
        ExportService.getAllColumns(availableNutrientIds) : 
        columns;

      if (!exportColumns) throw new Error('No columns specified for export');

      const formatRow = item => exportColumns.map(col => {
        if (col.isNested) {
          return ExportService.formatNestedFields(item, col.field);
        }
        if (col.isNutrient) {
          return ExportService.getNutrientValue(item.nutrition_details, col.nutrientId, col.valueType);
        }
        return formatProductField(item, col.field);
      });

      if (format === 'excel') {
        const headers = exportColumns.map(col => col.headerName);
        const rows = results.map(formatRow);
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, `product-export-${new Date().toISOString().split('T')[0]}.xlsx`);
        return true;
      }

      if (format === 'csv') {
        const headers = exportColumns.map(col => col.headerName).join(',');
        const rows = results.map(item =>
          formatRow(item).map(value => 
            value ? `"${value.toString().replace(/"/g, '""')}"` : ''
          ).join(',')
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
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export default ExportService;