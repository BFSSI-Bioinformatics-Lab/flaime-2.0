export const formatProductField = (item, field) => {
  switch (field) {
    case 'id':
      return item._id;
    case 'name':
      return item._source.site_name;
    case 'price':
      return item._source.reading_price;
    case 'source':
      return item._source.source?.name;
    case 'store':
      return item._source.store?.name;
    case 'date':
      return item._source.scrape_batch?.datetime;
    case 'region':
      return item._source.scrape_batch?.region;
    case 'category':
      return item._source.category || 'No category';
    case 'subcategory':
      return item._source.subcategory || 'No subcategory';
    default:
      return item._source[field] || '';
  }
};