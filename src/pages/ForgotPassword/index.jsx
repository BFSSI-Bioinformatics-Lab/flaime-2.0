import React, { useState, useEffect } from "react";
import { Typography,Grid, Button, } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "../SignIn/styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
import bcrypt from 'bcryptjs';

const ForgotPassword = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [userid, setUserid] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [emailSubject, setEmailSubject] = useState("")
    const [emailMessage, setEmailMessage] = useState("")
    const [emailReason, setEmailReason] = useState("")

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    var url = pathBase + `AddUserEmail?userid=${userid}&userEmail=${userEmail}&emailSubject=ForgotPassword&` +
                                       `emailMessage=ForgotPassword&emailReason=ForgotPassword`; 

    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    let navigate = useNavigate(); 
       
    console.log("In ForgotPassword page");
    
    const restorePassword = (event) => {
                      
        console.log("on ForgotPassword, in restorePassword: making api call: url = " + url);   
       
        axios.post(url, {}, {})
             .then(response => {
                navigate(`/FinalPage`);            
             });           
    };

    return (
        <SignInPageContainer>
            <SignInContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Forgot Password </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > Username </Typography>
                        <SignInInputField placeholder="Username"
                          onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Email* </Typography>
                        <SignInInputField placeholder="Email"
                          onChange={(e) => setUserEmail(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Button onClick={restorePassword}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Restore Password 
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </SignInContainer>
        </SignInPageContainer>
    )
}

export default ForgotPassword;