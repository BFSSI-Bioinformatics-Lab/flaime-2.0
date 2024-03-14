import React, { useState, useEffect } from "react";
import { Typography,Grid, Button, } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SignInHeader from "../../components/page/SignInHeader";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
import bcrypt from 'bcryptjs';

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
    const [userPassword, setUserPassword] = useState("");

    const StyledHeader = styled(TableCell)(({ theme }) => ({
      typography: 'subtitle',
      fontWeight: 'bold',
      fontSize: 16,
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        fontSize: 14,
    }));

    let navigate = useNavigate(); 
    
    const verifyUserBtn = (event) => {
        
        const salt = bcrypt.genSaltSync(10);
        const hashedUserPassword = bcrypt.hashSync(userPassword, salt); 

        let url = pathBase + `VerifyUser/?userid=${userid}&userPassword=${userPassword}`;  // TO-DO: will be "hashedUserPassword"  

        const response = axios.get(url);

        navigate(`/Home`);
    };

    const signUp = (event) => {
        navigate(`/SignUp`);            
    };

    const forgotPassword = (event) => {          
        navigate(`/ForgotPassword`);            
    };

    const setNewPassword = (event) => {
        navigate(`/SetNewPassword`);            
    };

    const adminUserMaintenance = (event) => {
        navigate(`/AdminUserMaintenance`);            
    };

    const updateUser = (event) => {
        navigate(`/UpdateUser`);            
    };

    return (
        <div>
          <div style={{ width: '100%', backgroundColor: 'blue' }} > <SignInHeader /> </div>
          <div>      
          <SignInPageContainer>            
            <SignInContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> Sign In </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > If you have not created an account yet, <br/>
                         then please <a href="#" onClick={signUp} style={{color: "blue"}} >sign up</a> first. </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > Username* </Typography>
                        <SignInInputField placeholder="Username" 
                           onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>
                        <Typography > Password* </Typography>
                        <SignInInputField placeholder="Password"
                          onChange={(e) => setUserPassword(e.target.value)} />
                    </Grid>
                    <Grid item> 
                        <div style={{textAlign:"left"}}>
                            <div style={{float:"left"}} > <CheckBox></CheckBox> </div>
                            <div style={{float:"left"}} > Remember Me </div>
                        </div>
                    </Grid>
                    <Grid item>
                    <a href="#" onClick={forgotPassword} style={{color: "blue"}} > <Typography color="blue" > Forgot Password? </Typography> </a>
                        <Button onClick={verifyUserBtn}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Sign In 
                            </Typography>
                        </Button>
                        <br /><br/>
                        <a href="#" onClick={setNewPassword} style={{color: "blue"}} > [TEMP. SHOWN - via Email ] Set New Password </a> 
                        <br/>
                        <a href="#" onClick={adminUserMaintenance} style={{color: "blue"}} > [TEMP. SHOWN - for Home] Admin User Maintenance </a>
                        <br/>
                        <a href="#" onClick={updateUser} style={{color: "blue"}} > [TEMP. SHOWN - for Home] Update User </a>
                    </Grid>
                </Grid>
            </SignInContainer>            
        </SignInPageContainer>
      </div>  
      </div>
    )
}

export default SignIn;