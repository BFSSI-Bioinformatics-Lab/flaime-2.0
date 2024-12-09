export const formatProductField = (item, field) => {
  switch (field) {
    case 'id':
      return item.id;
    case 'raw_upc':
      return item.raw_upc;
    case 'nielsen_upc':
      return item.nielsen_upc;
    case 'store_product_code':
      return item.store_product_code;
    case 'raw_brand':
      return item.raw_brand;
    case 'site_name':
      return item.site_name;
    case 'site_description':
      return item.site_description;
    case 'raw_serving_size':
      return item.raw_serving_size;
    case 'total_size':
      return item.total_size;
    case 'reading_price':
      return item.reading_price;
    case 'dietary_info_description':
      return item.dietary_info_description;
    case 'category':
      return item.category;
    case 'subcategory':
      return item.subcategory;
    case 'breadcrumb_array':
      return Array.isArray(item.breadcrumb_array) ? item.breadcrumb_array.join(' > ') : '';
    case 'site_url':
      return item.site_url;
    case 'ingredients.en':
      return item.ingredients?.en;
    case 'ingredients.fr':
      return item.ingredients?.fr;
    case 'source.name':
      return item.source?.name;
    case 'store.name':
      return item.store?.name;
    case 'scrape_batch.datetime':
      return item.scrape_batch?.datetime;
    case 'scrape_batch.region':
      return item.scrape_batch?.region;
    case 'scrape_batch.postal_code':
      return item.scrape_batch?.postal_code;
    case 'most_recent_flag':
      return item.most_recent_flag;
    case 'nutrition_available_flag':
      return item.nutrition_available_flag;
    default:
      if (field.includes('.')) {
        return field.split('.').reduce((obj, key) => obj?.[key], item);
      }
      return item[field] ?? '';
  }
};

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