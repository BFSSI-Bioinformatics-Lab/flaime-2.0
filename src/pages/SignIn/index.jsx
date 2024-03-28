import React, { useState, useEffect } from "react";
import { createContext, useContext} from 'react'
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SignInHeader from "../../components/page/SignInHeader";
import { APIPathBase, BcryptSalt } from "../../AppInitialization";
import bcrypt from 'bcryptjs';

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
import { Container, useTheme } from "@mui/material";

const SignIn = () => {

    const uiSessionId = "";  // UISessionId;  

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    
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

    let _userid = "";
    let _userRole = "";            
    let _passwordState = ""; 

    let _date = new Date();
    let _dateStr = _date.getFullYear() + '.' + _date.getMonth() + '.' + _date.getDay() + '_' +
                   _date.getHours() + '.' + _date.getMinutes() + '.' + _date.getSeconds() + '.' + 
                   _date.getMilliseconds(); 

    let _uiSessionId = "";

    const verifyUserBtn = (event) => {

        setMessage("");

        if (userid.length > 0 && userPassword.length > 0)
        {            
            const hashedPassword = bcrypt.hashSync(userPassword, BcryptSalt); 
            
            let url = APIPathBase + `VerifyUser?prmUserid=${userid}&prmUserPassword=${userPassword}`;  // TO-DO: will be "hashedUserPassword"  

            axios.get(url).then(response => {
                alert("in SignIn: response = " + JSON.stringify(response));

                _userid = response.data.userid;
                _userRole = response.data.userRole;
                _passwordState = response.data.passwordState;
                _uiSessionId = "FLAIME_" + _dateStr;    
                                                  
                if (_userRole.length > 0) {
                   
                   setMessage("");
                                      
                   if (_passwordState === "reassignedByAdmin" )
                   {      
                      navigate(`/SetNewPassword`,  { state:  
                        { userid: _userid, userRole: _userRole, uiSessionId: _uiSessionId }
                      } );   
                   }
                   else 
                   {    
                      navigate(`/Home`, { state: 
                        { userid: _userid, userRole: _userRole, uiSessionId: _uiSessionId }
                      } );   
                   }
                }
                else 
                {
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
        
        navigate('/SignUp', { state:  
            { userid: _userid, userRole: _userRole, uiSessionId: _uiSessionId }
          } );   // TO-DO: set state            
    };

    const forgotPassword = (event) => {
        
        let url = APIPathBase + `ForgotPassword/?userid=${userid}`;    

        const response = axios.put(url);
  
        navigate(`/Home`, { state: 
            { userid: _userid, userRole: _userRole, uiSessionId: _uiSessionId }
          });            
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
                            If password was reassigned by admin, please sign in and set the new password.                            
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