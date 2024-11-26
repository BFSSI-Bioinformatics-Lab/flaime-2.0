import React from 'react'
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/auth/AuthContext';
import PageContainer from '../PageContainer';



const Header = () => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [anchorEl3, setAnchorEl3] = React.useState(null);

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

    const handleLogout = () => {
        logout();
    };


    return (
        // <div>Header</div>
        <Box sx={{ flexGrow: 1, background: '#732C02' }}>
            <AppBar position="static">
                <PageContainer>
                    <Toolbar sx={{ paddingLeft: 0, paddingRight: 0 }} disableGutters>
                        <Typography variant="h6" component="div" 
                        sx={{ flexGrow: 1, cursor:'pointer' }} onClick={routeHome}>
                            FLAIME
                        </Typography>

                        {/* Menu Buttons */}
                        <Button
                            id="tools"
                            // aria-controls={open ? "tools-menu" : undefined}
                            aria-haspopup="true"
                            // aria-expanded={open ? "true" : undefined}
                            onClick={e=>setAnchorEl(e.currentTarget)}
                            color="inherit"
                            
                        >
                            Tools
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
                            <MenuItem component={Link} to='/tools/product-finder'
                            onClick={handleClose}>Product Finder</MenuItem>
                            <MenuItem component={Link} to='/tools/advanced-search'
                            onClick={handleClose}>Advanced Search</MenuItem>
                        </Menu>

                        <Button
                            id="reports"
                            // aria-controls={open ? "reports-menu" : undefined}
                            aria-haspopup="true"
                            // aria-expanded={open ? "true" : undefined}
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
                        </Menu>

                        <Button
                            id="about"
                            // aria-controls={open ? "basic-menu" : undefined}
                            aria-haspopup="true"
                            // aria-expanded={open ? "true" : undefined}
                            // onClick={handleClick}
                            color="inherit"
                            sx={{ mr: 2 }}
                            component={Link} to="/about"
                        >
                            About
                        </Button>

                        {user && (
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                sx={{ ml: 2 }}
                            >
                                Logout
                            </Button>
                        )}
                    </Toolbar>
                </PageContainer>
            </AppBar>
        </Box>
    )
}

export default Header