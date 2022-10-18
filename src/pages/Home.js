import { Container } from '@mui/system'
import React from 'react'
import { Image } from 'mui-image'
import landing from "../static/images/landing.jpg"
import quicklinks from "../static/images/quickLinks.jpg"
import { Typography, Box, Paper } from '@mui/material'
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height:'100px',
  width: '200px',
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
}));



const Home = () => {
  return (
    <div>
      <div className='landing-img' style={{ position: "relative" }}>
        <Image src={landing} height='550px' duration={0} easing='ease' opacity={0.5}></Image>
        
        <Typography variant="h2"  style={{position: "absolute", color: "rgb(115, 44, 2)",top: '30%',left: "25%",transform: "translateX(-60%)",}}>FLAIME</Typography>
        <Typography  style={{position: "absolute", color: "#732C02",top: '50%',left: "45%",transform: "translateX(-58%)",}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh nisl condimentum id venenatis a condimentum vitae. Non pulvinar neque laoreet suspendisse interdum.
        </Typography>
      </div>
      
      <Container>
        <Typography variant='h4'>Explore FLAIME</Typography>
      </Container>
      <div style={{height: "50vh", backgroundImage:`url(${quicklinks})`, backgroundRepeat: "no-repeat", backgroundSize: "cover"}}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ minHeight: "50vh", backgroundColor: 'rgba(241, 241, 241, 0.4)'}}
        >
          
            <Grid container rowSpacing={{xs: 1, sm: 2, md: 3}} 
            columnSpacing={{ xs: 1, sm: 2, md: 3 }} direction="row">
              <Grid item xs={6} sm={4} md={4} align="center">
                <Item>
                <Typography>Item 1</Typography>
                </Item>
              </Grid>
              <Grid item xs={6} sm={4} md={4} align="center">
                <Item><Typography>Item 2</Typography></Item>
              </Grid>
              <Grid item xs={6} sm={4} md={4} align="center">
                <Item><Typography>Item 3</Typography></Item>
              </Grid>
            {/* </Grid>
            <Grid container spacing={2} direction="row"> */}
              <Grid item xs align="center">
                <Item><Typography> Item 4</Typography></Item>
              </Grid>
              <Grid item xs align="center">
                <Item><Typography> Item 5</Typography></Item>
              </Grid>
            </Grid> 
          
          
        </Box>  
      </div>
      
      <Container>
        <h2>Footer</h2>
      </Container>
      
    </div>
  )
}

export default Home