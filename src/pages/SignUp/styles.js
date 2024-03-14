import { styled } from "@mui/system";
import { Box, Card, TextField } from "@mui/material";
import quickSearch from "../../static/images/singin.jpg"

export const SignupPageContainer = styled(Box)(() => ({
    backgroundImage: `url(${quickSearch})`,
    width: "100%", 
    minHeight: "calc(100vh - 140px)", 
    paddingBottom: 50,
    display: "flex",
    alignItems: "center"
}));

export const SignupContainer = styled(Card)(({theme}) => ({
    margin: "auto",
    padding: theme.spacing(3),
    maxWidth: 400,
    borderRadius: theme.spacing(3)
}));

export const SignupInputField = styled(TextField)(({theme}) => ({
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