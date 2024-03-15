import React, { useState, useEffect } from "react";
import { Typography, Grid, Button } from "@mui/material";
import { SignupContainer, SignupPageContainer, SignupInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';

import bcrypt from 'bcryptjs';

// SALT should be created ONE TIME upon sign up

const Signup = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [namePlaceholder, setNamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [name, setName] = useState("")
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    let navigate = useNavigate(); 

    const signup = (event) => {
      
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt); 
         
        alert("salt = " + salt);
        alert("password = " + password + ", hashedPassword = " + hashedPassword);

        var url = pathBase + `AddUser/?userName=${name}&userid=${userid}&password=${password}`;

        axios.post(url, {}, {})
            .then(response => {
               alert("response =" + JSON.stringify(response));
            }, 
            error => {
            console.log(error);
        }); 
        
        navigate(`/Home`);            
    };

    return (
        <SignupPageContainer>
            <SignupContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Sign Up </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > First & Last Name* </Typography>
                        <SignupInputField placeholder="First & Last Name" 
                          onChange={(e) => setName(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Username* </Typography>
                        <SignupInputField placeholder="Username" 
                          onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Password* </Typography>
                        <SignupInputField placeholder="Password" 
                          onChange={(e) => setPassword(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Confirm Password* </Typography>
                        <SignupInputField placeholder="Confirm Password" 
                          onChange={(e) => setConfirmPassword(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Button onClick={signup}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Sign Up 
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </SignupContainer>
        </SignupPageContainer>
    )
}

export default Signup;