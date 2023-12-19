import { Typography,Grid, Button, } from "@mui/material";
import { SignInContainer, SignInInputField, SignInPageContainer } from "./styles";
const SignIn = () => {

    return (
        <SignInPageContainer>
            <SignInContainer>
                <Grid container direction="column" justifyContent={"center"} alignItems={"center"} spacing={4}>
                    <Grid item pt={6}>
                        <Typography variant="h4" color="primary">Sign In</Typography>
                    </Grid>
                    <Grid item>
                        <SignInInputField placeholder="Username"/>
                    </Grid>
                    <Grid item>
                        <SignInInputField placeholder="Password"/>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="action" size="large" 
                            sx={{ width: 194, height: 62, borderRadius: 5, textTransform: "none"}}
                        >
                            <Typography variant="h5" color="white">
                                Login
                            </Typography>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="primary" align="center">
                            If you do not have an account please contact your supervisor
                        </Typography>
                    </Grid>
                </Grid>
            </SignInContainer>
        </SignInPageContainer>
    )
}

export default SignIn;