import { Container } from "@mui/material";

const PageContainer = ({children}) => {
    return <Container maxWidth={1800}>{children}</Container>
} 

export default PageContainer;