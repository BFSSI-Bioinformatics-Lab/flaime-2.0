import React, { useState, useEffect } from "react";
import { Typography,Grid, Button, } from "@mui/material";
import { SignupLoginContainer, SignupLoginPageContainer, SignupLoginInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    TableContainer
  } from '@mui/material';
  
const SignupLogin = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const [pathBase, setPathBase] = useState("https://localhost:7166/")  // 172.17.10.69:7251

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    var userid = "greg";
    var password = "success";
    var url = pathBase + `GetAllSignupLoginUsersAsync/?userid=${userid}&password=${password}`;  

    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    const verifySignupLogin = (event) => {
        
        console.log("making api call: url = " + url);   alert("making API call: url = " + url);
       
        axios.get(url, {}, { username: 'admin', password: 'abc' })
            .then(response => {
               alert("response.data[0].userConfirmed=" + JSON.stringify(response.data[0].userConfirmed));
        }, error => {
          console.log(error);
        });          
    };
    
  return (
        <SignupLoginPageContainer>
            <SignupLoginContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"center"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Sign Up / Login </Typography>
                    </Grid>
                    <Grid item>
                        <SignupLoginInputField placeholder="Username"/>
                    </Grid>
                    <Grid item>
                        <SignupLoginInputField placeholder="Password"/>
                    </Grid>
                    <Grid item>
                        <Button onClick={verifySignupLogin}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Sign Up / Login 
                            </Typography>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="primary" align="center">
                            If you do not have an account please contact your supervisor
                        </Typography>
                    </Grid>
                </Grid>
            </SignupLoginContainer>
        </SignupLoginPageContainer>
    )
}

export default SignupLogin;