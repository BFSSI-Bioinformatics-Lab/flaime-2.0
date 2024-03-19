import React, { useState, useEffect } from "react";
import { createContext, useContext} from 'react'
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SignInHeader from "../../components/page/SignInHeader";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
import bcrypt from 'bcryptjs';

import { Container, useTheme } from "@mui/material";
import {AppContext} from '../../App.js';

const SignIn = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const pathBase = "https://localhost:7166/api/";  // 172.17.10.69:7251/api/

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState("");

    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    const theme = useTheme();
    
    const localStyles = {
        inputField: { 
          backgroundColor: 'green' // , // theme.palette.primary.transparent.light,
        //  borderRadius: theme.spacing(2),
        //  maxWidth: "100%",
        //  width: 293,
        //  padding: theme.spacing(0.5),
        //  outline: "none",
        //  "& fieldset": { border: "none" }, 
        //  "& input": {
        //    textAlign: "center",
        //    color: theme.palette.primary.main,
        //    fontSize: 23 // ,
        //     "::placeholder, ::-ms-input-placeholder, :-ms-input-placeholder": { opacity: 0.8 }
        //  }
        }    
    };

    const [message, setMessage] = useState("");

    let navigate = useNavigate();
    
    const verifyUserBtn = (event) => {
        
        if (userid.length == 0)
        {
            setMessage("Userid is required");
        }
        else {

            if (password.length == 0)
            {
                setMessage("Password is required");
            }
            else {

                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt); 

                let url = pathBase + `VerifyUser/?userid=${userid}&userPassword=${password}`;  // TO-DO: will be "hashedUserPassword"  
                let result = 0;

                axios.get(url).then(response => {
                    result = parseInt(response.data);            
                }); 
        
                if (result == 1) {
                    setMessage("");
                    navigate(`/Home`);   
                }
            }            
        }
    };

    const signUp = (event) => {
        navigate(`/SignUp`);            
    };

    const forgotPassword = (event) => {
        
        alert("in ForgotPassword");

        let url = pathBase + `ForgotPassword/?userid=${userid}`;    

        const response = axios.put(url);
  
        navigate(`/Home`);  // Forgot Password          
    };

    const setNewPassword = (event) => {
        navigate(`/SetNewPassword`);            
    };

    const appContext = useContext(appContext);

    alert("in SignIn: appContext = " + JSON.stringify(appContext));

    return (            

          <div style={{ backgroundColor: 'lightgray' }}>
            <div style={{width: '100% !important' }} > <SignInHeader />  </div> <br/>            
            <div style={{width: '100% !important'}} > 
              <SignInContainer>
              <Typography style={{ color: 'red', fontWeight:'bold' }} > {message} </Typography>
                <Grid container direction="column" alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Sign In </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > 
                            If you have not created an account yet, <br/>
                            then please <a href="#" onClick={signUp} style={{color: "blue"}} >sign up</a> first. 
                            If password was reassigned by admin, please <a href="#" onClick={setNewPassword} 
                            style={{color: "blue"}} > set new password </a>.
                        </Typography>
                    </Grid>
                    <Grid item>
                    <TextField id="userid" label="Username" placeholder="Username" 
                                   type="text"
                                   autoComplete="current-password" 
                                   className={localStyles.inputField} 
                                   onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>                        
                        <TextField id="password" label="Password" placeholder="Password" 
                                   type={ showPassword ? "text" : "password" }
                                   autoComplete="current-password" 
                                   className={localStyles.inputField} 
                                   onChange={(e) => setPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showPassword}
                               type="checkbox" onChange={() => setShowPassword((prev) => !prev) } />
                    </Grid>
                    
                    <Grid item> 
                        <div style={{textAlign:"left"}}>
                            <div style={{float:"left"}} > <CheckBox></CheckBox> </div>
                            <div style={{float:"left"}} > Remember Me </div>
                        </div>
                    </Grid>
                    <Grid item>
                        <a href="#" onClick={forgotPassword} style={{color: "blue"}} > <Typography color="blue" > Forgot Password? </Typography> </a>
                        <br />
                        <Button onClick={verifyUserBtn}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Sign In 
                            </Typography>
                        </Button>
                        
                    </Grid>
                </Grid>
              </SignInContainer>
            </div> <br/>           
        </div>
    )
}

export default SignIn;