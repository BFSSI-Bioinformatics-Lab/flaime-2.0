import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, TextField } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';

import axios from 'axios';
import bcrypt from 'bcryptjs';
                  
const UserAdmin = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign In")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign In")
    const [pathBase, setPathBase] = useState("https://localhost:7166/api/")  // 172.17.10.69:7251

    const [message, setMessage] = useState("")
    const [adminUserid, setAdminUserid] = useState("nick")  // TO-DO set dynamically

    const [flName, setFLName] = useState("")
    const [userid, setUserid] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [confirmUserPassword, setConfirmUserPassword] = useState("")
    const [showUserPassword, setShowUserPassword] = useState("")
    const [showConfirmUserPassword, setShowConfirmUserPassword] = useState("")

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
               
        if (userid.length > 0 && userPassword.length > 0)
        {
            var url = pathBase + `ReassignUserPassword/?userid=${userid}&userPassword=${userPassword}&` +
            `adminUserid=${adminUserid}`;  
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
                if (userPassword.length === 0) {
                    setMessage("Password is required");        
                }
            }
        }            
    };

    const addUser = (event) => {

        var url = pathBase + `AddUser/?userFLName=${flName}&userid=${userid}&userPassword=${userPassword}&` +
          `adminUserid=${adminUserid}`;  

        axios.put(url, {}, {})
    .then(response => { /* alert("response = " + JSON.stringify(response)); */ }, 
                  error => { console.log(error); } ); 

        navigate(`/Home`);                
    };

    const deleteUser = (event) => {

        var url = pathBase + `DeleteUser/?userid=${userid}&adminUserid=${adminUserid}`;  

        axios.put(url, {}, {})
            .then(response => {
               // alert("response = " + JSON.stringify(response));
            }, 
            error => {
            console.log(error);
        }); 

        navigate(`/Home`);            
    };

    const saveCryptSalt = (event) => {

        alert("call saveCryptSalt");

        var cryptSalt = bcrypt.genSaltSync(10);

        var url = pathBase + `SaveCryptSalt/?cryptSalt=${cryptSalt}`;  

        axios.post(url).then(response => {
            alert("SaveCryptSalt = " + JSON.stringify(response));
        });
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
                                   type={ showUserPassword ? "text" : "password" }
                                   autoComplete="current-password"  
                                   onChange={(e) => setUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Password</label>
                        <input id="check" value={showUserPassword}
                               type="checkbox" onChange={() => setShowUserPassword((prev) => !prev) } />
                    </Grid>

                    <Grid item>                        
                        <TextField id="confirmUserPassword" label="Confirm Password*" placeholder="Confirm Password" 
                                   type={ showUserPassword ? "text" : "password" }
                                   autoComplete="current-password"                                     
                                   onChange={(e) => setConfirmUserPassword(e.target.value)} /> <br/>

                        <label for="check">Show Confirm Password</label>
                        <input id="check" value={showConfirmUserPassword}
                               type="checkbox" onChange={() => setShowConfirmUserPassword((prev) => !prev) } />
                    </Grid>

                    <Grid item>
                        <Button onClick={reassignUserPassword}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Reassign User Password 
                            </Typography>
                        </Button>
                      </Grid> 

                      <Grid item>
                        <Button onClick={addUser}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Add User 
                            </Typography>
                        </Button>
                      </Grid>
            
                      <Grid item>
                        <Button onClick={deleteUser}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Delete User 
                            </Typography>
                        </Button>
                      </Grid>

                      <Grid item>
                        <Button onClick={saveCryptSalt}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Save Crypt Salt 
                            </Typography>
                        </Button>
                      </Grid>
                </Grid>
            </SignInContainer>
        </SignInPageContainer>
    )
}

export default UserAdmin;