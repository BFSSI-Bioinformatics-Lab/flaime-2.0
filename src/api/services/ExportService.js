import { ApiInstance } from '../Api';

const buildExportQuery = (filters) => {
  // Query building implementation as before
};

class ExportService {
  static async exportProducts({
    format,
    columns,
    filters,
    limit
  }) {
    try {
      const query = buildExportQuery(filters);
      query.size = limit;
      query._source = columns.map(col => col.field);

      const response = await ApiInstance.post('/api/export/products', {
        query,
        format,
        columns
      }, {
        responseType: 'blob',
        timeout: 30000,
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `product-export-${timestamp}.${format}`;

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static async getExportColumns() {
    const response = await ApiInstance.get('/api/export/columns');
    return response.data;
  }
}

export default ExportService;