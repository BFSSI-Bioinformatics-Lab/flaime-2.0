import { formatProductField, formatNestedFields } from '../../utils/format/dataFormatting';
import { executeSearch } from '../../utils/search/searchUtils';
import { SODIUM_FIELD_ORDER } from '../../utils/constants/export/fieldOrder';
import { SODIUM_FIELD_MAPPING } from '../../utils/constants/export/fieldMapping';
import { SODIUM_NUTRIENT_MAPPING } from '../../utils/constants/export/nutrientMapping';
import { formatUPC, formatDate, formatSizeValue, extractCategories } from '../../utils/format/dataFormatting';
import * as XLSX from 'xlsx';

class ExportService {
  static columnMappers = {
    UPC: (value) => formatUPC(value),
    LSalesUPC: (value) => formatUPC(value),
    LCollDate: (value) => formatDate(value),
    Delivery_Date: (value) => formatDate(value),
    NpPrd: () => '1',
    total_size: (value) => {
      const { value: num } = formatSizeValue(value);
      return num;
    },
    serving_size: (value) => {
      const { value: num } = formatSizeValue(value);
      return num;
    }
  };

  static getNutrientValue(nutritionDetails, nutrientName, valueType) {
    const nutrient = nutritionDetails?.find(n => 
      n.nutrient_name.toUpperCase() === nutrientName.toUpperCase()
    );
    
    if (!nutrient) return '';

    const valueMapping = {
      amount: 'amount',
      dv: 'daily_value',
      dvPPD: 'daily_value_ppd',
      kj: 'amount_kj',
      kjPPD: 'amount_kj_ppd'
    };

    return nutrient[valueMapping[valueType]] || '';
  }

  static getFieldMapping(headerName) {
    const field = Object.entries(SODIUM_FIELD_MAPPING)
      .find(([_, h]) => h === headerName)?.[0];
      
    return {
      field: field || headerName,
      headerName,
      isNested: field?.includes('.')
    };
  }

  static getAllColumns() {
    return SODIUM_FIELD_ORDER.map(this.getFieldMapping);
  }

  static transformColumns(columns) {
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }
    return columns.map(this.getFieldMapping);
  }

  static formatValue(item, column) {
    const categoryFields = ['GBLClassNum', 'GBLClassDesc', 'ClassNum', 'ClassDesc'];
    if (categoryFields.includes(column.headerName)) {
      return extractCategories(item.categories)[column.headerName];
    }
  
    if (this.columnMappers[column.headerName]) {
      return this.columnMappers[column.headerName](
        formatProductField(item, column.field, 'export')
      );
    }
  
    for (const [nutrientName, mapping] of Object.entries(SODIUM_NUTRIENT_MAPPING)) {
      const valueTypes = ['amount', 'dv', 'dvPPD', 'kj', 'kjPPD'];
      for (const type of valueTypes) {
        if (mapping[type] === column.headerName) {
          return this.getNutrientValue(item.nutrition_details, nutrientName, type);
        }
      }
    }
  
    if (column.isNested) {
      return formatNestedFields(item, column.field);
    }
  
    return formatProductField(item, column.field, 'export');
  }
  
  static formatRow(item, columns) {
    return columns.map(column => this.formatValue(item, column));
  }

  static async exportToExcel(results, exportColumns) {
    const headers = exportColumns.map(col => col.headerName);
    const rows = results.map(item => this.formatRow(item, exportColumns));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `product-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  static exportToCsv(results, exportColumns) {
    const headers = exportColumns.map(col => col.headerName).join(',');
    const rows = results.map(item =>
      this.formatRow(item, exportColumns)
        .map(value => value ? `"${value.toString().replace(/"/g, '""')}"` : '')
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `product-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  static async exportProducts({format, type, getQuery, columns}) {
    try {
      const query = getQuery(format);
      let { results } = await executeSearch(query);
      results = results.map(r => r._source);

      const exportColumns = type === 'sodium' ? 
        this.getAllColumns() : 
        this.transformColumns(columns);

      if (!exportColumns) {
        throw new Error('No columns specified for export');
      }

      return format === 'excel' 
        ? await this.exportToExcel(results, exportColumns)
        : this.exportToCsv(results, exportColumns);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export default ExportService;