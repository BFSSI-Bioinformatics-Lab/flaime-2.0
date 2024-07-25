import { Box, Container, Paper, Typography, IconButton, Card } from "@mui/material";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";

export const AboutPageContainer = styled("div")(({theme}) => ({
    backgroundColor: theme.palette.landing.main
}))

export const PageTitleTypography = styled(Typography)(() => ({
    margin: "0 auto",
    padding: "20px",
    color: "rgb(115, 44, 2)",
    textAlign: "center",
}));

export const DataInfoContainer = styled(Box)(() => ({
    padding: "0 10%", 
    display: "flex",
    flexDirection: "column", 
    alignItems: "right", 
    // justifyContent: "space-between",
    // marginBottom: "35px",
    // marginTop: "15px"
}))