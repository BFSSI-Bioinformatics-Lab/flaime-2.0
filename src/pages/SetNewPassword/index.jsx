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

const SetNewPassword = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    var userid = "nick";
    var url = pathBase + `UpdateUserSetPassword/?userid=` + userid + `&userPassword=${newPassword}`; 
                                               
    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    let navigate = useNavigate(); 
       
    const savePasswordBtn = (event) => {
        
        if (newPassword == confirmNewPassword)
        {
           alert("newPassword == confirmNewPassword: url = " + url);
       
           setErrorMessage("");    

           axios.post(url, {}, {})
             .then(response => {
               alert("response =" + JSON.stringify(response));
             });   
        
            navigate(`/Home`);
        }
        else
        {
            setErrorMessage("Passwords are not equal.");    
        }            
    };

    return (
        <SignInPageContainer>
            <SignInContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography color="red" > {errorMessage} </Typography>
                    </Grid>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Set New Password </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > Username </Typography>
                        <Typography > glibenson </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > New Password* </Typography>
                        <SignInInputField placeholder="New Password" 
                          onChange={(e) => setNewPassword(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Confirm New Password* </Typography>
                        <SignInInputField placeholder="Confirm New Password"
                          onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Button onClick={savePasswordBtn}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Save Password 
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </SignInContainer>
        </SignInPageContainer>
    )
}

export default SetNewPassword;