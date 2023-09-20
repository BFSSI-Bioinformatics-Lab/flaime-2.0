import { Container, useTheme } from "@mui/material";


const PageContainer = ({children}) => {
    const theme = useTheme();
    return <Container sx={{maxWidth: theme.page.content.max}} maxWidth={false}>{children}</Container>
}

export default PageContainer;