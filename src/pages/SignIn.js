import quickSearch from "../static/images/singin.jpg"
import { Card, Typography, TextField, Grid, Button, Box } from "@mui/material";
import { styled } from "@mui/system";

const SignInPageContainer = styled(Box)(({theme}) => ({
    backgroundImage: `url(${quickSearch})`,
    width: "100%", 
    minHeight: "calc(100vh - 140px)", 
    paddingBottom: 50,
    display: "flex",
    alignItems: "center"
}));

const SignInContainer = styled(Card)(({theme}) => ({
    margin: "auto",
    padding: theme.spacing(3),
    maxWidth: 400,
    borderRadius: theme.spacing(3)
}));

const SignInInputField = styled(TextField)(({theme}) => ({
    backgroundColor: theme.palette.primary.transparent.light,
    borderRadius: theme.spacing(2),
    maxWidth: "100%",
    width: 293,
    padding: theme.spacing(0.5),
    outline: "none",
    "& fieldset": {
        border: "none"
    },
    "& input": {
        textAlign: "center",
        color: theme.palette.primary.main,
        fontSize: 23,
        "::placeholder, ::-ms-input-placeholder, :-ms-input-placeholder": {
          opacity: 0.8
        }
      },
}));


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