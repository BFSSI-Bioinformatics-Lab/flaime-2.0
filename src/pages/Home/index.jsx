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
import FinalPage from "../../components/page/FinalPage";

import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Home = () => {

  let navigate = useNavigate();

  let location = useLocation();

  let _userid = "";
  let _userRole = "";
  let _uiSessionId = "";
  let _isValidUser = false;

  if (location != null && location.state != null) 
  {
    if (location.state.userid.length > 0)
    {
      _userid = location.state.userid;
    }

    if (location.state.userRole.length > 0)
    {
      _userRole = location.state.userRole;
    }
    
    if (location.state.uiSessionId.length > 0)
    {
      _uiSessionId = location.state.uiSessionId;  

      if (_uiSessionId.length > 0)
      {
         _isValidUser = true;
      }
    }
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

  const userAdmin = (event) => {
    navigate(`/UserAdmin`);            
};

  // setHeaderMenuDisplay("")

  return ( 

    <HomePageContainer>      
      {!_isValidUser && <FinalPage /> }
      {_isValidUser &&  <div>     
      <Header userRole={_userRole} />
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
      </div> }
    </HomePageContainer> 
  )
}

export default Home;