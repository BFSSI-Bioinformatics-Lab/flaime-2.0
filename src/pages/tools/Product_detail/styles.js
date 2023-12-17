import { Box, Paper } from "@mui/material";
import { styled } from "@mui/system";

export const ProductInfoBox = styled(Box)(() => ({
    padding: "40px 0" 
}));

export const ProductStatItem = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#fff',
    ...theme.typography.body1,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    boxShadow: "none"
  }));

export const PageIcon = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.landing.main,
    padding: theme.spacing(1),
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: 0,
    marginRight: theme.spacing(2)
}));

export const PageTitle = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#D9965B',
    ...theme.typography.h4,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#f5f5f5',
    boxShadow: "none"
}));

export const DetailItem = styled(Paper)(({ theme }) => ({
    backgroundColor:  '#fff',
    ...theme.typography.body1,
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'start',
    color: '#191919'
}));

export const ProductImageContainer = styled("div")(() => ({
    margin: "50px 0"
}));

export const ProductIngredientsHeadingContainer = styled("div")(() => ({
    marginTop: "40px", 
    marginBottom: "10px"
}));
