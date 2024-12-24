// utils/dataFormatting.js

export const NESTED_FIELDS = {
  categories: {
    path: "categories",
    fields: ["name", "level", "scheme"]
  }
};

export const formatNestedFields = (item, nestedField) => {  
  const nested = item[nestedField];
  if (!nested?.length) return '';
  return nested.map(entry => {
    return NESTED_FIELDS[nestedField].fields
      .map(field => entry[field])
      .filter(Boolean)
      .join(' - ');
  }).join(' | ');
};

export const extractCategories = (categories) => {
  if (!categories?.length) return {
    GBLClassNum: '',
    GBLClassDesc: '',
    ClassNum: '',
    ClassDesc: ''
  };

  const level1 = categories.find(cat => cat.level === 1);
  const level2 = categories.find(cat => cat.level === 2);

  return {
    GBLClassNum: level1?.code || '',
    GBLClassDesc: level1?.name || '',
    ClassNum: level2?.code || '',
    ClassDesc: level2?.name || ''
  };
};

export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).replace(/,/g, '');
};

export const formatUPC = (upc) => {
  if (!upc) return '';
  return upc.padStart(15, '0');
};

export const formatSizeValue = (sizeString) => {
  if (!sizeString) return { value: '', unit: '' };
  const match = sizeString.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
  return match ? { value: match[1], unit: match[2] } : { value: '', unit: '' };
};

export const formatBoolean = (value) => {
  return value ? 'TRUE' : 'FALSE';
};


export const formatProductField = (item, field, format = 'display') => {
  const baseFormatting = (value, isForDisplay = true) => {
    if (value === null || value === undefined) return '';
    if (isForDisplay && typeof value === 'object') {
      if (Array.isArray(value)) return value.join(', ');
      return Object.values(value).join(', ');
    }
    return String(value);
  };

  const getValue = () => {
    const categoryFields = {
      GBLClassNum: true,
      GBLClassDesc: true,
      ClassNum: true,
      ClassDesc: true
    };

    if (categoryFields[field]) {
      return extractCategories(item.categories)[field];
    }

    switch (field) {
      case 'id':
        return item.id;
      case 'raw_upc':
        return item.raw_upc;
      case 'nielsen_upc':
        return formatUPC2(item.nielsen_upc);
      case 'store_product_code':
        return item.store_product_code;
      case 'raw_brand':
        return item.raw_brand;
      case 'name':
        return item.site_name;
      case 'price':
        return item.reading_price;
      case 'site_description':
        return item.site_description;
      case 'breadcrumb_array':
        return Array.isArray(item.breadcrumb_array) ? item.breadcrumb_array : item.breadcrumb_array;
      case 'ingredients.en':
        return item.ingredients?.en;
      case 'ingredients.fr':
        return item.ingredients?.fr;
      case 'source':
        return item.source?.name;
      case 'store':
        return item.store?.name;
      case 'date':
        return formatDate2(item.scrape_batch?.datetime);
      case 'region':
        return item.scrape_batch?.region;
      case 'most_recent_flag':
      case 'nutrition_available_flag':
      case 'products_variety_pack_flag':
        return format === 'display' ? formatBoolean2(item[field]) : item[field];
      case 'nutrition_facts_json':
        return item.nutrition_facts_json;
      default:
        if (field.includes('.')) {
          return field.split('.').reduce((obj, key) => obj?.[key], item);
        }
        return item[field] ?? '';
    }
  };

  const value = getValue();
  
  if (format === 'export') {
    return value;
  }
  
  return baseFormatting(value, true);
};

// Helper function for date formatting
const formatDate2 = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// Helper function for boolean formatting
const formatBoolean2 = (value) => {
  return value ? 'Yes' : 'No';
};

// Helper function for UPC formatting
const formatUPC2 = (upc) => {
  return upc || '';
};

// Nutrition formatting helpers
export const formatNutrientValue = (nutritionDetails, nutrientId, valueType) => {
  const nutrient = nutritionDetails?.find(n => n.nutrient_id === nutrientId);
  if (!nutrient) return '';
  
  switch (valueType) {
    case 'amount':
      return nutrient.amount ? `${nutrient.amount}${nutrient.unit}` : '';
    case 'dv':
      return nutrient.daily_value || '';
    default:
      return '';
  }
};

export const formatServingInfo = (servingString) => {
  if (!servingString) return { count: '', description: '', amount: '', unit: '' };
  
  // Handle formats like "Per 7 crisps (20 g)"
  const match = servingString.match(/Per (\d+) (.*?) \((\d+)\s*([a-zA-Z]+)\)/i);
  if (match) {
    return {
      count: match[1],
      description: match[2],
      amount: match[3],
      unit: match[4]
    };
  }
  
  return { count: '', description: '', amount: '', unit: '' };
};