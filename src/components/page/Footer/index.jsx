import { Container, Typography } from "@mui/material";

import { FooterContainer } from './styles';

const Footer = () => {
    return  (
        <FooterContainer >
            <Typography variant="h3" color="primary" align="center">
                © FLAIME 2022
            </Typography>
        </FooterContainer>
    )
}

export default Footer;