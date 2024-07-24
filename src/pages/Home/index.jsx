import React from 'react'
import { Image } from 'mui-image'
import landing from "../../static/images/landing.jpg"
import { Typography } from '@mui/material'
import DataSourceCard from "../../components/cards/DataSourceCard";
import SearchCard from "../../components/cards/SearchCard";

import {
  ShoppingCartIcon,
  HomePageContainer,
  PageTitleTypography,
  PageDescriptionTypography,
  SearchBarContainer,
  DataSourceContainer,
  
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
            title="FLIP Data"
            content="University of Toronto FLIP* database of prepackaged food labels. The 2017 collection includes pictures and food information off labels from Sobeys, Loblaws and Metro in Toronto."
            link="/tools/product-browser"
          />
          <DataSourceCard
            title="Nielsen Data"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            link="/tools/advanced-search"
          />
          <DataSourceCard
            title="Web Scrape Data"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            link="/tools/product-finder"
          />
        </DataSourceContainer>
      </div>

      <SearchBarContainer>
      <SearchCard
        title="Quick Search"
        content="The Product Browser is a user-friendly search interface where users can quickly search for products, stores, etc.. within the database."
        link="/tools/product-browser"
      />
      <SearchCard
        title="Advanced Search"
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        link="/tools/advanced-search"
      />
      <SearchCard
        title="Product Finder"
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        link="/tools/product-finder"
      />
      </SearchBarContainer>
      
    </HomePageContainer>
  )
}

export default Home