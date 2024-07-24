import React from 'react'
import { Image } from 'mui-image'
import landing from "../../static/images/landing.jpg"
import { CardContent, Typography, Button, CardActions, Divider } from '@mui/material'
import Grid from '@mui/material/Grid';
import DataSourceCard from "../../components/cards/DataSourceCard";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import {
  ShoppingCartIcon,
  HomePageContainer,
  PageTitleTypography,
  PageDescriptionTypography,
  SearchBarContainer,
  DataSourceContainer,
  SearchCard,
  HeadingContainer
} from "./styles";

const Home = () => {


  return (
    <HomePageContainer>
      <div className='landing-img' style={{ position: "relative" }}>
        <Image src={landing} height='550px' duration={0} easing='ease' opacity={0.5}></Image>
        
        <PageTitleTypography variant="h2">FLAIME</PageTitleTypography>
        <PageDescriptionTypography>
        The Food Label AI for Monitoring the food Environment (FLAIME) is a tool created to collect, organize, harmonize and simplify exploration of various food label datasets. Here you will find multiple ways to explore, query and export information related to the Canadian food supply. Customized reports, visualizations and dashboards are also available to offer informative insights on FND priorities such as the Sodium Reduction Strategy, Front of Pack Labelling, Supplemented Foods and Marketing to Kids.
        </PageDescriptionTypography>
      </div>
      <div>
        <HeadingContainer maxWidth="sm">
          <Typography variant="h3" color="primary.dark" align="center">About the Data Sources</Typography>
        </HeadingContainer>

        <DataSourceContainer>
          <DataSourceCard
            title="Quick Search"
            content="The Product Browser is a user-friendly search interface where users can quickly search for products, stores, etc.. within the database."
            link="/tools/product-browser"
          />
          <DataSourceCard
            title="Advanced Search"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            link="/tools/advanced-search"
          />
          <DataSourceCard
            title="Product Finder"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            link="/tools/product-finder"
          />
        </DataSourceContainer>
      </div>

      <SearchBarContainer>
        {/* <SearchBar placeholder="Quick Search" width="452px" height="75px" /> */}
        <SearchCard>
            <CardContent>
              <Typography variant='h5'>
                Quick Search
              </Typography>
              <Typography variant='body1' style={{ marginTop: '15px' }}>
              The Product Browser is a user-friendly search interface where users can quickly search for products, stores, etc.. within the database.
              </Typography>
              <CardActions>
              <Link to="/tools/product-browser">
              <Button >Quick Search <SearchIcon fontSize="medium" style={{ marginLeft: '10px' }}/></Button>
              </Link>
            </CardActions>
            </CardContent>
          </SearchCard>
        <SearchCard>
            <CardContent>
              <Typography variant='h5'>
                Advanced Search
              </Typography>
              <Typography variant='body1'style={{ marginTop: '15px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
              <CardActions>
              <Link to="/tools/advanced-search">
                <Button >Advanced Search<SearchIcon fontSize="medium" style={{ marginLeft: '10px' }}/></Button>
              </Link>
              </CardActions>
            </CardContent>
          </SearchCard>
          
          <SearchCard>
            <CardContent>
              <Typography variant='h5'>
                Product Finder
              </Typography>
              <Typography variant='body1'style={{ marginTop: '15px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
              <CardActions>
              <Link to="/tools/product-finder">
              <Button >Search many products <SearchIcon fontSize="medium" style={{ marginLeft: '10px' }}/></Button>
              </Link>
            </CardActions>
            </CardContent>
          </SearchCard>
      </SearchBarContainer>

      {/* <HeadingContainer maxWidth="sm">
        <Typography variant="h3" color="primary.dark" align="center">Explore the FLAIME Database</Typography>
      </HeadingContainer>
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
      </ExploreSectionContainer> */}
      
    </HomePageContainer>
  )
}

export default Home