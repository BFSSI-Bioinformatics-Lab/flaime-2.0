import React, {useState, useContext} from "react"
import { Image } from 'mui-image'
import landing from "../../static/images/landing.jpg"
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid';
import SearchBar from "../../components/inputs/SearchBar";
import {Context} from "../../App"
import {
  ExploreItem,
  ArrowButtonLink,
  ArrowButton,
  ShoppingCartIcon,
  HomePageContainer,
  PageTitleTypography,
  PageDescriptionTypography,
  SearchBarContainer,
  ExploreHeadingContainer,
  ExploreSectionContainer,
  ExploreSectionBox,
  ExploreItemTitleTypography,
  ArrowCircleRightIcon
} from "./styles";

import Header from "../../components/page/Header";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Home = () => {

  const location = useLocation();
  let isAdmin = false;

  alert("location.state.userRole = " + location.state.userRole);

  if (location.state.userRole === 'admin')
  {
    isAdmin = true;   alert("isAdmin= " + isAdmin);
  }

  // const [headerMenuDisplay, setHeaderMenuDisplay] = useState("") 

  const exploreItems = [
    {
      title: "Get reports by Stores",
      icon: <ShoppingCartIcon />,
      link: "reports/store"
    },
    {
      title: "Explore all products",
      icon: <ShoppingCartIcon />,
      link: "tools/product-browser"
    },
    {
      title: "Get reports by Category",
      icon: <ShoppingCartIcon />,
      link: "reports/category"
    },
    {
      title: "Explore all data and data history",
      icon: <ShoppingCartIcon />,
      link: "data/quality"
    },
    {
      title: "Get reports by Nutrient",
      icon: <ShoppingCartIcon />,
      link: "reports/nutrient"
    },
  ];

  let navigate = useNavigate();

  const userAdmin = (event) => {
    navigate(`/UserAdmin`);            
};

  // setHeaderMenuDisplay("")

  return (
    <HomePageContainer>
      <Header />
      <div className='landing-img' style={{ position: "relative" }}>

        <Image src={landing} height='550px' duration={0} easing='ease' opacity={0.5}></Image>
        
        <PageTitleTypography variant="h2">FLAIME</PageTitleTypography>
        <PageDescriptionTypography>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh nisl condimentum id venenatis a condimentum vitae. Non pulvinar neque laoreet suspendisse interdum.
        </PageDescriptionTypography>
      </div>
      <SearchBarContainer>
        <SearchBar placeholder="Quick Search" width="452px" height="75px" />
      </SearchBarContainer>
      
      <ExploreHeadingContainer maxWidth="sm">
        <Typography variant="h2" color="primary.dark" align="center">Explore the FLAIME Database</Typography>
      </ExploreHeadingContainer>
      <ExploreSectionContainer>
        <ExploreSectionBox
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          
            <Grid container 
              rowSpacing={{xs: 1, sm: 2, md: 6}} 
              columnSpacing={{ xs: 1, sm: 2, md: 6 }}
              direction="row"
              alignItems="center"
              justifyContent="space-evenly"
            >
              {exploreItems.map((item) => 
                  <Grid item key={item.title}
                    xs={12} 
                    sm={12} 
                    md={6} 
                    lg={4}
                    align="center"
                  >
                    <ExploreItem>
                      <Typography color="primary">{item.icon}</Typography>
                      <ExploreItemTitleTypography variant="subtitle" align="left">{item.title}</ExploreItemTitleTypography>
                      <ArrowButton>
                        <ArrowButtonLink to={item.link}>
                          <ArrowCircleRightIcon />
                        </ArrowButtonLink>
                      </ArrowButton>
                    </ExploreItem>
                  </Grid>
                )
              }
            </Grid>
        </ExploreSectionBox>  
      </ExploreSectionContainer>
      
    </HomePageContainer>
  )
}

export default Home