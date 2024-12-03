import { buildElasticsearchQuery, executeSearch, formatProductField } from '../../utils';
import * as XLSX from 'xlsx';

class ExportService {
  static async exportProducts({
    format,
    columns,
    filters
  }) {
    try {
      const query = buildElasticsearchQuery({
        filters,
        options: {
          includeNutrition: true,
          isExport: true
        }
      });
      const { results } = await executeSearch(query);

      if (format === 'excel') {
        const headers = columns.map(col => col.headerName);
        const rows = results.map(item =>
          columns.map(col => formatProductField(item, col.field))
        );
        
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `product-export-${timestamp}.xlsx`);
        return true;
      }

      if (format === 'csv') {
        const headers = columns.map(col => col.headerName).join(',');
        const rows = results.map(item =>
          columns.map(col => {
            const value = formatProductField(item, col.field);
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
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export default ExportService;