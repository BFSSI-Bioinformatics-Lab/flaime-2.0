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

const SignInHeader = () => {

    // const [headerMenuDisplay, setHeaderMenuDisplay] = React.useContext(Context);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorEl2, setAnchorEl2] = React.useState(null);
    const [anchorEl3, setAnchorEl3] = React.useState(null);

    // const open = Boolean(anchorEl);
    // const handleClick = (event) => {
    //   setAnchorEl(event.currentTarget);
    // };

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
        <Box sx={{ flexGrow: 1, background: '#732C02', width: '100%' }}>
            <AppBar position="static">
                <PageContainer>
                    <Toolbar sx={{ paddingLeft: 0, paddingRight: 0 }} disableGutters>
                        <Typography variant="h6" component="div" 
                        sx={{ flexGrow: 1, cursor:'pointer' }} onClick={routeHome}>
                            FLAIME   
                        </Typography>

                        <Tooltip title="Account Login">
                            <IconButton align="right"
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

export default SignInHeader