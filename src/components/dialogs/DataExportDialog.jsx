import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Box
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useExport } from '../../hooks/useExport';

const EXPORT_FORMATS = [
  { 
    id: 'csv',
    label: 'CSV',
    description: 'Standard comma-separated values format',
    maxRows: 100000
  },
  { 
    id: 'excel',
    label: 'Excel Spreadsheet',
    description: 'Microsoft Excel compatible format',
    maxRows: 50000
  }
];

const MAX_ROWS_WITHOUT_WARNING = 10000;

const DataExportDialog = ({ 
  currentColumns,
  totalProducts,
  searchFilters,
  availableFormats = EXPORT_FORMATS 
}) => {
  const { exportData, isExporting } = useExport();
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState('current');
  const [format, setFormat] = useState(availableFormats[0]?.id);
  
  const selectedFormat = availableFormats.find(f => f.id === format);
  const willExceedLimit = totalProducts > (selectedFormat?.maxRows || Infinity);
  const showWarning = totalProducts > MAX_ROWS_WITHOUT_WARNING;

  const handleExport = async () => {
    if (willExceedLimit) {
      alert(`This export exceeds the maximum limit of ${selectedFormat.maxRows.toLocaleString()} rows for ${selectedFormat.label} format. Please contact administrative staff for assistance with large exports.`);
      return;
    }

    try {
      await exportData({
        format: format,
        type: exportType,
        columns: currentColumns,
        filters: searchFilters
      });
      setOpen(false);
    } catch (error) {
      alert('Export failed. If this problem persists with smaller datasets, please contact support.');
    }
  };

  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<DownloadIcon />} 
        onClick={() => setOpen(true)}
      >
        Export Data
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Export Type</InputLabel>
              <Select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                label="Export Type"
              >
                <MenuItem value="current">
                  Current View ({currentColumns.length} columns)
                </MenuItem>
                <MenuItem value="all">
                  Complete Dataset (All Fields)
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                label="Format"
              >
                {availableFormats.map(format => (
                  <MenuItem key={format.id} value={format.id}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedFormat?.description}
            </Typography>

            {showWarning && (
              <Alert 
                severity={willExceedLimit ? "error" : "warning"}
                sx={{ mb: 2 }}
              >
                {willExceedLimit ? (
                  <>
                    This export exceeds the maximum limit of {selectedFormat.maxRows.toLocaleString()} rows 
                    for {selectedFormat.label} format. Please contact administrative staff 
                    for assistance with large exports.
                  </>
                ) : (
                  <>
                    Exporting {totalProducts.toLocaleString()} products may take some time. 
                    The application will remain responsive, but please wait for the download 
                    to complete.
                  </>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || willExceedLimit}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            {isExporting ? 'Preparing Export...' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataExportDialog;