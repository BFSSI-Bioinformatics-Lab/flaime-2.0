import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignupContainer, SignupPageContainer, SignupInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import bcrypt from 'bcryptjs';

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';

// SALT should be created ONE TIME upon sign up

const Signup = () => {

    const location = useLocation();

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign Up")
    const [namePlaceholder, setNamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign Up")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [flName, setFLName] = useState("")
    const [userid, setUserid] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [confirmUserPassword, setConfirmUserPassword] = useState("")
    const [showUserPassword, setShowUserPassword] = useState("");

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
         
        // alert("salt = " + salt);
        // alert("password = " + password + ", hashedPassword = " + hashedPassword);

        var url = pathBase + `AddUser/?userName=${flName}&userid=${userid}&password=${password}`;

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
                      <TextField id="userFLName" label="First & Last Name*" placeholder="First & Last Name" 
                                   type="text"
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setUserFLName(e.target.value)} />
                    </Grid>
                    <Grid item>
                      <TextField id="userid" label="Username*" placeholder="Username" 
                                   type="text"
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setUserid(e.target.value)} />
                    </Grid>
                    <Grid item>                        
                        <TextField id="password" label="Password*" placeholder="Password" 
                                   type={ showPassword ? "text" : "password" }
                                   autoComplete="current-password"  
                                   onChange={(e) => setUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showUserPassword}
                               type="checkbox" onChange={() => setShowUserPassword((prev) => !prev) } />
                    </Grid>

                    <Grid item>                        
                        <TextField id="confirmPassword" label="Confirm Password*" placeholder="Confirm Password" 
                                   type={ showPassword ? "text" : "password" }
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setConfirmUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showPassword}
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