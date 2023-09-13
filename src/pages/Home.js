import { Container } from '@mui/system'
import React from 'react'
import { Link } from "react-router-dom";
import { Image } from 'mui-image'
import landing from "../static/images/landing.jpg"
import quicklinks from "../static/images/quickLinks.jpg"
import { Typography, Box, Paper, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import ShoppingCardIcon from "@mui/icons-material/ShoppingCart";
import ArrowCircleRight from "@mui/icons-material/ArrowCircleRight";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  textAlign: 'center',
  color: theme.palette.primary.dark,
  height:'187px',
  width: '410px',
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: '24px',
  fontSize: "30px"
}));

const ArrowButtonLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.light,
  fontSize: 0,
}));

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  transform: "translate(350px, 60px)",
}));

const Home = () => {
  const theme = useTheme();

  const exploreItems = [
    {
      title: "Get reports by Stores",
      icon: <ShoppingCardIcon sx={{ fontSize: 77 }} />,
      link: ""
    },
    {
      title: "Explore all products",
      icon: <ShoppingCardIcon sx={{ fontSize: 77 }} />,
      link: ""
    },
    {
      title: "Get reports by Category",
      icon: <ShoppingCardIcon sx={{ fontSize: 77 }} />,
      link: ""
    },
    {
      title: "Explore all data and data history",
      icon: <ShoppingCardIcon sx={{ fontSize: 77 }} />,
      link: ""
    },
    {
      title: "Get reports by Nutrient",
      icon: <ShoppingCardIcon sx={{ fontSize: 77 }} />,
      link: ""
    },
  ]

  return (
    <div style={{ backgroundColor: theme.palette.landing.main }}>
      <div className='landing-img' style={{ position: "relative" }}>
        <Image src={landing} height='550px' duration={0} easing='ease' opacity={0.5}></Image>
        
        <Typography variant="h2"  style={{position: "absolute", color: "rgb(115, 44, 2)",top: '30%',left: "25%",transform: "translateX(-60%)",}}>FLAIME</Typography>
        <Typography  style={{position: "absolute", color: "#732C02",top: '50%',left: "45%",transform: "translateX(-58%)",}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh nisl condimentum id venenatis a condimentum vitae. Non pulvinar neque laoreet suspendisse interdum.
        </Typography>
      </div>
      
      <Container maxWidth="sm" sx={{ padding: "30px"}}>
        <Typography variant="h2" color="primary" align="center">Explore the FLAIME Database</Typography>
      </Container>
      <div style={{backgroundImage:`url(${quicklinks})`, backgroundRepeat: "no-repeat", backgroundSize: "cover"}}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ minHeight: "50vh", backgroundColor: 'rgba(241, 241, 241, 0.4)', padding: "2vh 0"}}
        >
          
            <Grid container 
              rowSpacing={{xs: 1, sm: 2, md: 6}} 
              columnSpacing={{ xs: 1, sm: 2, md: 6 }}
              direction="row"
              alignItems="center"
              justifyContent="space-evenly"
            >
              {exploreItems.map((item, index) => 
                  <Grid item key={item.title}
                    xs={12} 
                    sm={12} 
                    md={6} 
                    lg={4}
                    align="center"
                  >
                    <Item>
                      {item.icon}
                      <Typography variant="subtitle" align="left" sx={{ margin: "0 42px" }}>{item.title}</Typography>
                      <ArrowButton>
                        <ArrowButtonLink>
                          <ArrowCircleRight sx={{ fontSize: 44 }}/>
                        </ArrowButtonLink>
                      </ArrowButton>
                    </Item>
                  </Grid>
                )
              }
            </Grid> 
          
          
        </Box>  
      </div>
      
    </div>
  )
}

export default Home