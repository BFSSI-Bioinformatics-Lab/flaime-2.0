import React, {useState, createContext, useContext} from 'react'
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from '@mui/material/Tooltip';

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import PageContainer from '../PageContainer';
import {Context} from '../../../App.js';

const Header = () => {

    // const [headerMenuDisplay, setHeaderMenuDisplay] = React.useContext(Context);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [anchorEl3, setAnchorEl3] = React.useState(null);

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setAnchorEl2(null);
        setAnchorEl3(null);
    };

    let navigate = useNavigate(); 

    const routeHome = () =>{ 
        let path = '/'; 
        navigate(path);
    }

    const routeSignIn = () =>{ 
        let path = '/signin'; 
        navigate(path);
    }

    const navigation = useContext(Context);
    
    return (
        // <div>Header</div>
        <Box sx={{ flexGrow: 1, background: '#732C02' }}>
            <AppBar position="static">
                <PageContainer>
                    <Toolbar sx={{ paddingLeft: 0, paddingRight: 0 }} disableGutters>
                        <Typography variant="h6" component="div" 
                                    sx={{ flexGrow: 1, cursor:'pointer' }} onClick={routeHome} >
                            FLAIME  
                        </Typography>

                        {/* Menu Buttons */}
                        <Button
                            id="tools"
                            //aria-controls={open ? "tools-menu" : undefined}
                            aria-haspopup="true"
                            //aria-expanded={open ? "true" : undefined}
                            onClick={e=>setAnchorEl(e.currentTarget)}
                            color="inherit"                            
                        >
                            tools
                        </Button>
                        <Menu
                            id="tools-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            MenuListProps={{
                            "aria-labelledby": "tools-button"
                            }}
                            PaperProps={{sx:{
                                bgcolor:'rgba(115, 44, 2,0.9)', 
                                color:'white',
                                "& .MuiMenuItem-root:hover": {
                                backgroundColor: "rgba(217, 150, 91,0.4)"
                                },
                            }}}
                        >
                            <MenuItem component={Link} to='/tools/product-browser'
                            onClick={handleClose}>Product Browser</MenuItem>
                            <MenuItem component={Link} to='/tools/batch-browser'
                            onClick={handleClose}>Batch Browser</MenuItem>
                            <MenuItem component={Link} to='/tools/report-builder'
                            onClick={handleClose}>Report Builder</MenuItem>
                            <MenuItem component={Link} to='/tools/advanced-search'
                            onClick={handleClose}>Advanced Search</MenuItem>
                        </Menu>

                        <Button
                            id="reports"
                            //aria-controls={open ? "reports-menu" : undefined}
                            aria-haspopup="true"
                            //aria-expanded={open ? "true" : undefined}
                            onClick={e=>setAnchorEl2(e.currentTarget)}
                            color="inherit"
                            
                        >
                            Reports
                        </Button>
                        <Menu
                            id="reports-menu"
                            anchorEl={anchorEl2}
                            open={Boolean(anchorEl2)}
                            onClose={handleClose}
                            MenuListProps={{
                            "aria-labelledby": "reports-button"
                            }}
                            PaperProps={{sx:{
                                bgcolor:'rgba(115, 44, 2,0.9)', 
                                color:'white',
                                "& .MuiMenuItem-root:hover": {
                                backgroundColor: "rgba(217, 150, 91,0.4)"
                                },
                            }}}
                        >
                            <MenuItem component={Link} to='/reports/store'
                            onClick={handleClose}>By Store</MenuItem>
                            <MenuItem component={Link} to='/reports/category'
                            onClick={handleClose}>By Category</MenuItem>
                            <MenuItem component={Link} to='/reports/nutrient'
                            onClick={handleClose}>By Nutrient</MenuItem>
                        </Menu>

                        <Button
                            id="data"
                            // aria-controls={open ? "tools-menu" : undefined}
                            aria-haspopup="true"
                            // aria-expanded={open ? "true" : undefined}
                            onClick={e=>setAnchorEl3(e.currentTarget)}
                            color="inherit"                            
                        >
                            Data
                        </Button>
                        <Menu
                            id="data-menu"
                            anchorEl={anchorEl3}
                            open={Boolean(anchorEl3)}
                            onClose={handleClose}
                            MenuListProps={{
                            "aria-labelledby": "data-button"
                            }}
                            PaperProps={{sx:{
                                bgcolor:'rgba(115, 44, 2,0.9)', 
                                color:'white',
                                "& .MuiMenuItem-root:hover": {
                                backgroundColor: "rgba(217, 150, 91,0.4)"
                                },
                            }}}
                        >
                            <MenuItem component={Link} to='/data/quality'
                            onClick={handleClose}>Quality</MenuItem>
                            <MenuItem component={Link} to='/data/download'
                            onClick={handleClose}>Download</MenuItem>
                            <MenuItem component={Link} to='/data/visualizations'
                            onClick={handleClose}>Visualizations</MenuItem>
                        </Menu>

                        <Button
                            id="about"
                            //aria-controls={open ? "basic-menu" : undefined}
                            aria-haspopup="true"
                            //aria-expanded={open ? "true" : undefined}
                            // onClick={handleClick}
                            color="inherit"
                            sx={{ mr: 2 }}
                            component={Link} to="/about"
                        >
                            About
                        </Button>

                        <Tooltip title="Account Login">
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="login"
                                onClick={routeSignIn}
                            >
                                <AccountCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </PageContainer>
            </AppBar>
        </Box>
    )
}

export default Header