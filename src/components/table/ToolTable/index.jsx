import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, TablePagination, TableSortLabel } from '@mui/material';
import { StyledTableCell } from './styles';
import { Link } from 'react-router-dom';

const SORTABLE_COLUMNS = {
  id: 'id',
  external_id: 'external_id.keyword',
  name: 'site_name.keyword',
  price: 'reading_price.keyword',
  source: 'source.name.keyword',
  store: 'store.name.keyword',
  date: 'scrape_batch.datetime',
  region: 'scrape_batch.region.keyword',
  storage_condition: 'storage_condition.keyword',
  primary_package_material: 'primary_package_material.keyword',
};

const ToolTable = ({ columns, data, totalCount, page, rowsPerPage, onPageChange, onRowsPerPageChange, sortField, sortOrder, onSortChange }) => {
  const renderCell = (column, item) => {
    switch (column) {
      case 'id':
        return <Link to={`/tools/product-browser/${item._id}`} target="_blank">{item._id}</Link>;
      case 'name':
        return item._source.site_name;
      case 'price':
        return item._source.reading_price;
      case 'source':
        return item._source.source.name;
      case 'store':
        return item._source.store.name;
      case 'date':
        return item._source.scrape_batch.datetime;
      case 'region':
        return item._source.scrape_batch.region;
      case 'categories':
        return item._source.categories && item._source.categories.length > 0
          ? item._source.categories
              .sort((a, b) => a.level - b.level)
              .map(cat => cat.name)
              .join(' > ')
          : 'No category';
      default:
        return item._source[column] || '';
    }
  };

  const headerMapping = {
    id: 'ID',
    external_id: 'External ID',
    name: 'Product Name',
    price: 'Price',
    source: 'Source',
    store: 'Store',
    date: 'Date',
    region: 'Region',
    categories: 'Categories',
    storage_condition: 'Storage Condition',
    primary_package_material: 'Packaging Material',
    allergens_warnings: 'Allergens',
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column}>
                {onSortChange && SORTABLE_COLUMNS[column] ? (
                  <TableSortLabel
                    active={sortField === column}
                    direction={sortField === column ? sortOrder : 'asc'}
                    onClick={() => onSortChange(column)}
                  >
                    {headerMapping[column] || column}
                  </TableSortLabel>
                ) : (
                  headerMapping[column] || column
                )}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column}>
                  {renderCell(column, item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </TableContainer>
  );
};

export default ToolTable;