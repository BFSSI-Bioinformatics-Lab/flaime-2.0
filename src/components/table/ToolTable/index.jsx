import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { StyledTableCell } from './styles';
import { Link } from 'react-router-dom';

const ToolTable = ({ selectedColumns, searchResults }) => {
  return (
    <div style={{ height: '500px', overflow: 'auto', marginTop: '20px' }}>
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
                    {column === 'source' && <span>{item._source.sources.name}</span>}
                    {column === 'store' && <span>{item._source.stores.name}</span>}
                    {column === 'date' && <span>{item._source.scrape_batches.scrape_datetime}</span>}
                    {column === 'region' && <span>{item._source.scrape_batches.region}</span>}
                    {column === 'category' && (
                    <span>
                        {item._source.categories && item._source.categories[0] && item._source.categories[0].name ? item._source.categories.map(cat => cat.name).join(", ") : 'No category'}
                    </span>
                    )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ToolTable;