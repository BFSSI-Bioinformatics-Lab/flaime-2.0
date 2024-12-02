import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, TablePagination } from '@mui/material';
import { StyledTableCell } from './styles';
import { formatProductField } from '../../../utils/format/dataFormatting';
import { Link } from 'react-router-dom';

const ToolTable = ({ columns, data, totalCount, page, rowsPerPage, onPageChange, onRowsPerPageChange }) => {
  const renderCell = (column, item) => 
    column === 'id' 
      ? <Link to={`/tools/product-browser/${formatProductField(item, 'id')}`} target="_blank">
          {formatProductField(item, 'id')}
        </Link>
      : formatProductField(item, column);
  
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column}>{column}</StyledTableCell>
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