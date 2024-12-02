import { buildElasticsearchQuery, executeSearch, formatProductField} from '../../utils'

class ExportService {
  static async exportProducts({
    format,
    columns,
    filters
  }) {
    try {
      if (format === 'csv') {
        const query = buildElasticsearchQuery({
          filters,
          options: {
            includeNutrition: true,
            isExport: true
          }
        });

        const { results } = await executeSearch(query);

        // Format the data
        const headers = columns.map(col => col.headerName).join(',');
        const rows = results.map(item => 
          columns.map(col => {
            const value = formatProductField(item, col.field);
            return value ? `"${value.toString().replace(/"/g, '""')}"` : '';
          }).join(',')
        );

        // Create and download CSV
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