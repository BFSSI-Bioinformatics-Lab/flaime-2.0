import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "../SignIn/styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

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

    const [currentUserPassword, setCurrentUserPassword] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [confirmNewUserPassword, setConfirmNewUserPassword] = useState("")
    const [showCurrentUserPassword, setShowCurrentUserPassword] = useState("")
    const [showNewUserPassword, setShowNewUserPassword] = useState("")
    const [showConfirmNewUserPassword, setShowConfirmNewUserPassword] = useState("")

    const [errorMessage, setErrorMessage] = useState("")

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

    const location = useLocation();
  
    let _userid = "";
    let _userRole = "";

    if (location != null && location.state != null) 
    {
        if (location.state.userid != null && location.state.userid.length > 0)
        {
            _userid = location.state.userid;
        }

        if (location.state.userRole != null && location.state.userRole.length > 0)
        {
            _userRole = location.state.userRole;
        }
    }

    var url = pathBase + `SetPassword/?userid=` + _userid + `&userPassword=${newUserPassword}`; 
                                               
    const savePasswordBtn = (event) => {
        
    if (newUserPassword.length > 0 && confirmNewUserPassword.length > 0 && newUserPassword === confirmNewUserPassword)
        {
            setErrorMessage("");    

            axios.put(url)
              .then(response => {
                  alert("in SetNewPassword: response = " + JSON.stringify(response));

                  navigate(`/Home`, { state: { userRole: _userRole } } );   
            });                
        }
        else
        {
            if (newUserPassword.length == 0)
            {
                setErrorMessage("New Password is required");
            }
            else
            {
                if (confirmNewUserPassword.length == 0)
                {
                    setErrorMessage("Confirm New Password is required");
                }
                else
                {
                    if (newUserPassword != confirmNewUserPassword)
                    {
                        setErrorMessage("Passwords are not equal.");
                    }
                }                    
            }                
        }             
    }

    return (
        <SignInPageContainer>
            <SignInContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography style={{ color: 'red', fontWeight: 'bold' }} > {errorMessage} </Typography>
                    </Grid>

                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Set New Password </Typography>
                    </Grid>
                    
                    <Grid item>
                        <Typography > Username </Typography>
                        <Typography > <b> {_userid} </b> </Typography>
                    </Grid>
                    
                    <Grid item>                        
                        <TextField id="newUserPassword" label="New Password*" placeholder="New Password" 
                                   type={ showNewUserPassword ? "text" : "password" }
                                   autoComplete="current-password"  
                                   onChange={(e) => setNewUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show New Password</label>
                        <input id="check" value={showNewUserPassword}
                               type="checkbox" onChange={() => setShowNewUserPassword((prev) => !prev) } />
                    </Grid>
                    
                    <Grid item>                        
                        <TextField id="confirmNewUserPassword" label="Confirm New Password*" placeholder="Confirm New Password" 
                                   type={ showConfirmNewUserPassword ? "text" : "password" }
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setConfirmNewUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Confirm New Password</label>
                        <input id="check" value={showConfirmNewUserPassword}
                               type="checkbox" onChange={() => setShowConfirmNewUserPassword((prev) => !prev) } />
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