import { Container, Typography } from "@mui/material";

import { styled } from '@mui/material/styles';

const FooterContainer = styled(Container)(({ theme }) => ({
    padding: "20px",
    backgroundColor: theme.palette.landing
}));

const Footer = () => {
    return  (
        <FooterContainer >
            <Typography variant="h3" color="primary.dark" align="center">
                © FLAIME 2022
            </Typography>
        </FooterContainer>
    )
}

export default Footer;