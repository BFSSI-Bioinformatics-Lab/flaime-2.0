import { useState, useRef } from 'react';
import { ButtonGroup, Button, Paper, MenuList, MenuItem, Popper, ClickAwayListener } from '@mui/material';

const TableActionButtons = ({columns, onColumnClick}) => {

    const [columnsMenuAnchorEl, setColumnsMenuAnchorEl] = useState(null);
    const columnsMenuRef = useRef();
    const handleMenuClose = () => setColumnsMenuAnchorEl(null);
    const columnsMenuOpen = Boolean(columnsMenuAnchorEl);
    const onColumnsMenuButtonClick = (e) => setColumnsMenuAnchorEl(columnsMenuRef.current)
    return (
        <ButtonGroup>
            <Button sx={{ width: 200 }} ref={columnsMenuRef} variant="contained" size="large" onClick={onColumnsMenuButtonClick}>Column Visibility</Button>
            <Popper sx={{ zIndex: 1000 }}anchorEl={columnsMenuAnchorEl} open={columnsMenuOpen} onClose={handleMenuClose}>
                <ClickAwayListener onClickAway={handleMenuClose}>
                    <Paper sx={{ width: 200, backgroundColor: "primary.dark" }}>
                        <MenuList>
                            { columns && 
                                columns.map((column, i) => 
                                    <MenuItem onClick={() => onColumnClick(i)}
                                        sx={{ "&, &:hover": { color: column.visible ? "white" : "primary.dark" , 
                                                backgroundColor: column.visible ? "primary.dark" : "white",
                                            }   
                                        }}
                                    >
                                        {column.headerName}
                                    </MenuItem>
                                )
                            }
                        </MenuList>
                    </Paper>
                </ClickAwayListener>
            </Popper>
            <Button variant="contained" size="large">Excel</Button>
            <Button variant="contained" size="large">CSV</Button>
            <Button variant="contained" size="large">PDF</Button>
        </ButtonGroup>
    )
}

export default TableActionButtons;