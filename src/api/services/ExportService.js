import { buildElasticsearchQuery, executeSearch } from '../../utils/search/searchUtils';
import { formatProductField, formatNestedFields, NESTED_FIELDS } from '../../utils/format/dataFormatting';
import { SODIUM_FIELD_ORDER } from '../../utils/constants/export/fieldOrder';
import { SODIUM_FIELD_MAPPING } from '../../utils/constants/export/fieldMapping';
import { SODIUM_NUTRIENT_MAPPING } from '../../utils/constants/export/nutrientMapping';
import { formatUPC, formatDate, formatSizeValue } from '../../utils/format/dataFormatting';
import * as XLSX from 'xlsx';

class ExportService {
  static getAllColumns() {
    return SODIUM_FIELD_ORDER.map(headerName => {
      const field = Object.entries(SODIUM_FIELD_MAPPING).find(([_, h]) => h === headerName)?.[0];
      return {
        field: field || headerName,
        headerName,
        isNested: field && field in NESTED_FIELDS
      };
    });
  }

  static getNutrientValue(nutritionDetails, nutrientName, valueType) {
    const nutrient = nutritionDetails?.find(n => 
      n.nutrient_name.toUpperCase() === nutrientName.toUpperCase()
    );
    
    if (!nutrient) return '';

    switch (valueType) {
      case 'amount':
        return nutrient.amount || '';
      case 'dv':
        return nutrient.daily_value || '';
      case 'dvPPD':
        // Calculate per portion daily value if needed
        return nutrient.daily_value_ppd || '';
      case 'kj':
        // Special case for energy in kilojoules
        return nutrient.amount_kj || '';
      case 'kjPPD':
        return nutrient.amount_kj_ppd || '';
      default:
        return '';
    }
  }

  static formatRow(item, columns) {
    return columns.map(col => {
      // Handle special case for NpPrd
      if (col.headerName === 'NpPrd') {
        return '1';
      }

      // Handle special formatting cases
      if (col.headerName === 'UPC' || col.headerName === 'LSalesUPC') {
        return formatUPC(formatProductField(item, col.field, 'export'));
      }

      if (col.headerName === 'LCollDate' || col.headerName === 'Delivery_Date') {
        return formatDate(formatProductField(item, col.field, 'export'));
      }

      // Handle nutrition fields
      for (const [nutrientName, mapping] of Object.entries(SODIUM_NUTRIENT_MAPPING)) {
        if (col.headerName === mapping.amount) {
          return ExportService.getNutrientValue(item.nutrition_details, nutrientName, 'amount');
        }
        if (col.headerName === mapping.dv) {
          return ExportService.getNutrientValue(item.nutrition_details, nutrientName, 'dv');
        }
        if (col.headerName === mapping.dvPPD) {
          return ExportService.getNutrientValue(item.nutrition_details, nutrientName, 'dvPPD');
        }
        if (mapping.kj && col.headerName === mapping.kj) {
          return ExportService.getNutrientValue(item.nutrition_details, nutrientName, 'kj');
        }
        if (mapping.kjPPD && col.headerName === mapping.kjPPD) {
          return ExportService.getNutrientValue(item.nutrition_details, nutrientName, 'kjPPD');
        }
      }

      // Handle size fields
      if (col.field === 'total_size' || col.field === 'serving_size') {
        const value = formatProductField(item, col.field, 'export');
        const { value: num, unit } = formatSizeValue(value);
        return col.headerName.endsWith('UoM') ? unit : num;
      }

      // Handle nested fields
      if (col.isNested) {
        return formatNestedFields(item, col.field);
      }

      // Handle missing fields
      if (!col.field || !(col.field in item)) {
        return '';
      }

      return formatProductField(item, col.field, 'export');
    });
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

      let { results } = await executeSearch(query);
      results = results.map(r => r._source);
      
      const exportColumns = type === 'all' ? 
        ExportService.getAllColumns() : 
        columns;

      if (!exportColumns) throw new Error('No columns specified for export');

      if (format === 'excel') {
        const headers = exportColumns.map(col => col.headerName);
        const rows = results.map(item => ExportService.formatRow(item, exportColumns));
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, `product-export-${new Date().toISOString().split('T')[0]}.xlsx`);
        return true;
      }

      if (format === 'csv') {
        const headers = exportColumns.map(col => col.headerName).join(',');
        const rows = results.map(item =>
          ExportService.formatRow(item, exportColumns).map(value => 
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