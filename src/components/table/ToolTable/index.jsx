import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from '@mui/material';
import { StyledTableCell } from './styles';
import { Link } from 'react-router-dom';

const ToolTable = ({ selectedColumns, searchResults }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {selectedColumns.map((column) => (
              <StyledTableCell key={column}>{column}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {searchResults.map((item, index) => (
            <TableRow key={index}>
              {selectedColumns.map((column) => (
                <TableCell key={column}>
                  {column === 'id' && <Link to={`/tools/product-browser/${item._id}`} target="_blank">{item._id}</Link>}
                  {column === 'name' && <span>{item._source.site_name}</span>}
                  {column === 'price' && <span>{item._source.reading_price}</span>}
                  {column === 'source' && <span>{item._source.source.name}</span>}
                  {column === 'store' && <span>{item._source.store.name}</span>}
                  {column === 'date' && <span>{item._source.scrape_batch.datetime}</span>}
                  {column === 'region' && <span>{item._source.scrape_batch.region}</span>}
                  {column === 'category' && (
                    <span>
                      {item._source.category && item._source.category.name ? item._source.category.name : 'No category'}
                    </span>
                  )}
                  {column === 'subcategory' && (
                    <span>
                      {item._source.subcategory && item._source.subcategory.name ? item._source.subcategory.name : 'No subcategory'}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ToolTable;