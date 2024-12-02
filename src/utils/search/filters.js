// utils/search/filters.js
import { useState } from 'react';

export const useSearchFilters = (initialFilters) => {
  const [searchInputs, setSearchInputs] = useState(initialFilters);

  const handleInputChange = (field, value) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return [searchInputs, handleInputChange];
};

export const getFieldKey = (inputMode) => {
  switch(inputMode) {
    case 'Name':
      return 'site_name.keyword';
    case 'ID':
      return 'id';
    case 'UPC':
      return 'raw_upc.keyword';
    case 'Nielsen_UPC':
      return 'nielsen_upc.keyword';
    default:
      return 'site_name.keyword';
  }
};
