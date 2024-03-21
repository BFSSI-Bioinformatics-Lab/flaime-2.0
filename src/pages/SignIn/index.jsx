import React, { useState, useEffect } from "react";
import { createContext, useContext} from 'react'
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SignInHeader from "../../components/page/SignInHeader";
import { APIPathBase, BcryptSalt, UISessionId, AdminUserid } from "../../AppInitialization";
import bcrypt from 'bcryptjs';

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
import { Container, useTheme } from "@mui/material";

const SignIn = () => {

    
    const uiSessionId = UISessionId;  

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    // const pathBase = "https://localhost:7166/api/";  // 172.17.10.69:7251/api/

    const [controller, setController] = useState({
        page: 0,
        rowsPerPage: 10,
        search: null
    });

    const [userid, setUserid] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [showUserPassword, setShowUserPassword] = useState("");
    
    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    const theme = useTheme();
    
    const [message, setMessage] = useState("");

    let navigate = useNavigate();
    
    const verifyUserBtn = (event) => {
        
        setMessage("");

        if (userid.length > 0 && userPassword.length > 0)
        {            
            const hashedPassword = bcrypt.hashSync(userPassword, BcryptSalt); 
            
            let url = APIPathBase + `VerifyUser/?userid=${userid}&userPassword=${userPassword}`;  // TO-DO: will be "hashedUserPassword"  
            
            let result = 0;

            axios.get(url).then(response => {
                
                if (response.data.userRole.length > 0) {
                    // alert("in SignIn, verifyUserBtn: response.data.userRole = " + JSON.stringify(response.data.userRole));        

                    setMessage("");
                    
                    alert("in SignIn: response.data.passwordState = " + response.data.passwordState);

                    if (response.data.passwordState.length > 0)
                    {      alert("navigate(`/SetNewPassword`)");
                        navigate(`/SetNewPassword`);   
                    }
                    else {    alert("navigate(`/Home`)");
                        navigate(`/Home`, { state: { userRole: response.data.userRole } } );   
                    }
                }
                else {
                    setMessage("Username and Password combination is invalid");
                }
            });     
        }
        else
        {
            if (userid.length === 0)
            {
                setMessage("Username is required");
            }
            else {    
                if (userPassword.length === 0)
                {
                    setMessage("Password is required");
                }
            }
        }
    };

    const signUp = (event) => {  
        
        // alert("in SignIn signUp function");
        
        navigate('/SignUp', { state: { z: ' ' } } );            
    };

    const forgotPassword = (event) => {
        
        alert("in ForgotPassword");

        let url = APIPathBase + `ForgotPassword/?userid=${userid}`;    

        const response = axios.put(url);
  
        navigate(`/Home`);  // Forgot Password          
    };

    const setNewPassword = (event) => {
        navigate(`/SetNewPassword`);            
    };

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
                      <TextField id="userid" label="Username*" placeholder="Username" 
                                   type="text"
                                   autoComplete="current-password"  
                                   onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>                        
                        <TextField id="userPassword" label="Password*" placeholder="Password" 
                                   type={ showUserPassword ? "text" : "password" }
                                   autoComplete="current-password"                                    
                                   onChange={(e) => setUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showUserPassword}
                               type="checkbox" onChange={() => setShowUserPassword((prev) => !prev) } />
                    </Grid>
{/*                    
                    <Grid item> 
                        <div style={{textAlign:"left"}}>
                            <div style={{float:"left"}} > <CheckBox></CheckBox> </div>
                            <div style={{float:"left"}} > Remember Me </div>
                        </div>
                    </Grid>
*/}                    
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