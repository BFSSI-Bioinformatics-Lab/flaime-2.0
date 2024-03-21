import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
const UserAdmin = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign In")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign In")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [message, setMessage] = useState("")
    const [adminUserid, setAdminUserid] = useState("")

    const [flName, setFLName] = useState("")
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState("")

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
    
    const reassignUserPassword = (event) => {
               
        if (userid.length > 0 && password.length > 0)
        {
            var url = pathBase + `ReassignUserPassword/?userid=${userid}&password=${password}`;  
                    // alert("url = " + url);        
            var response = axios.put(url, {}, {}).then(response => {
                // alert("response =" + JSON.stringify(response));
                navigate(`/Home`);
            }); 
        }
        else {
            if (userid.length === 0) {
                setMessage("Userid is required");
            }
            else {    
                if (password.length === 0) {
                    setMessage("Password is required");        
                }
            }
        }            
    };

    const addUser = (event) => {

        var url = pathBase + `AddUser/?userFLName=${flName}&userid=${userid}&password=${password}`;  

        axios.put(url, {}, {})
    .then(response => { /* alert("response = " + JSON.stringify(response)); */ }, 
                  error => { console.log(error); } ); 

        navigate(`/Home`);                
    };

    const deleteUser = (event) => {

        var url = pathBase + `DeleteUser/?userid=${userid}`;  

        axios.put(url, {}, {})
            .then(response => {
               // alert("response = " + JSON.stringify(response));
            }, 
            error => {
            console.log(error);
        }); 

        navigate(`/Home`);            
    };

    return (
        <SignInPageContainer>
            <SignInContainer>                
                <Grid container direction="column" justifyContent={"center"} alignItems={"left"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary"> User Admin </Typography>
                    </Grid>
                    <Grid item>
                        <Typography style={{ color: 'red', fontWeight:'bold' }} > {message} </Typography>
                    </Grid>
                    <Grid item>
                      <TextField id="userid" label="First & Last Name*" placeholder="First & Last Name" 
                                 type="text"
                                 autoComplete="current-password"                                     
                                 onChange={(e) => setFLName(e.target.value)} />
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
                                   onChange={(e) => setPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showPassword}
                               type="checkbox" onChange={() => setShowPassword((prev) => !prev) } />
                    </Grid>

                    <Grid item>                        
                        <TextField id="password" label="Confirm Password*" placeholder="Confirm Password" 
                                   type={ showPassword ? "text" : "password" }
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setConfirmPassword(e.target.value)} /> <br/>

                        <label for="check">Show Confirm Password</label>
                        <input id="check" value={showConfirmPassword}
                               type="checkbox" onChange={() => setShowConfirmPassword((prev) => !prev) } />
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
                        <Button onClick={reassignUserPassword}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Reassign User Password 
                            </Typography>
                        </Button>
                      </Grid> 
                      <br/>
                      <Grid item>
                        <Button onClick={addUser}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Add User 
                            </Typography>
                        </Button>
                      </Grid>
                      <br/>
                      <Grid item>
                        <Button onClick={deleteUser}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Delete User 
                            </Typography>
                        </Button>
                      </Grid>
                </Grid>
            </SignInContainer>
        </SignInPageContainer>
    )
}

export default UserAdmin;