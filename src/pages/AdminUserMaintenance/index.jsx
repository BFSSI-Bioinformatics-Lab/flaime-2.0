import React, { useState, useEffect } from "react";
import { Typography,Grid, Button, } from "@mui/material";
import { SignInContainer, SignInPageContainer, SignInInputField } from "./styles";
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { CheckBox } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, 
         TableContainer } from '@mui/material';
  
const AdminUserMaintenance = () => {

    const [lang, setLang] = useState("en")
    const [header, setHeader] = useState("Sign In")
    const [usernamePlaceholder, setUsernamePlaceholder ] = useState("Username")
    const [passwordPlaceholder, setPasswordPlaceholder ] = useState("Password")
    const [buttonEnterName, setButtonEnterName] = useState("Sign In")
    const [pathBase, setPathBase] = useState("https://localhost:7166/")  // 172.17.10.69:7251

    const [user_userid, setUser_userid] = useState("")
    const [user_userPassword, setUser_userPassword] = useState("")
    const [admin_User, setAdmin_User] = useState("")

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
    
    const getUser = (event) => {
        
        alert("in GetUser: making API call: url = " + url);
       
        var url = pathBase + `GetUser/?userid=${user_userid}&userPassword=${user_userPassword}`;  

        axios.get(url, {}, {})
            .then(response => {
               alert("response = " + JSON.stringify(response));
            }, 
            error => {
            console.log(error);
        }); 

        navigate(`/Home`);            
    };

    const addUser = (event) => {};

    const deleteUser = (event) => {

        var url = pathBase + `UpdateUserSetDeleted/?userid=${user_userid}&userPassword=${user_userPassword}`;  

        alert("in DeleteUser: making API call: url = " + url);
       
        axios.get(url, {}, {})
            .then(response => {
               alert("response = " + JSON.stringify(response));
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
                        <Typography variant="h4" color="primary"> Admin User Maintenance </Typography>
                    </Grid>
                    <Grid item>
                        <Typography > Username* </Typography>
                        <SignInInputField placeholder="Username"/>
                    </Grid>
                    <Grid item>
                        <Button onClick={getUser}  variant="contained" color="action" size="large" 
                                sx={{ width: 250, height: 62, borderRadius: 5, textTransform: "none"}} >

                            <Typography variant="h5" color="white">
                                Get User 
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

export default AdminUserMaintenance;