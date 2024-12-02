import { useState } from 'react';
import ExportService from '../api/services/ExportService';

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (config) => {
    try {
      setIsExporting(true);
      await ExportService.exportProducts({
        format: config.format,
        columns: config.type === 'current' ? config.columns : null,
        filters: config.filters,
        limit: config.format === 'excel' ? 50000 : 100000
      });
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData: handleExport,
    isExporting
  };
};