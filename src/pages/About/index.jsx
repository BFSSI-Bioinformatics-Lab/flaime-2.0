import React from 'react'
import { Typography } from '@mui/material'
import { AboutPageContainer, DataInfoContainer, PageTitleTypography } from './styles'

const About = () => {
  return (
    <AboutPageContainer>
        
      <PageTitleTypography variant="h3">About FLAIME</PageTitleTypography>

      <div>
        <Typography variant="h4" color="primary.dark" style={{padding: "20px", marginLeft: "20px"}}>Terms and Conditions of the data in the FLAIME database</Typography>
        <DataInfoContainer>
          <div id='FLIP'>
            <Typography variant='h5'>FLIP Data</Typography>
            <Typography variant='body1'>
            University of Toronto Food Label Information Program (FLIP) database of prepackaged food labels. Data accessed via data sharing agreement between the University of Toronto and Health Canada’s Bureau of Nutritional Sciences and Office of Nutrition Policy and Promotion expiring October 5, 2025. Data is confidential. For information about the data and its use, please contact Susan Trang (susan.trang@hc-sc.gc.ca; lead for data sharing agreement). Results from FLIP data used in non-confidential documents must be reviewed by Mary L’Abbé’s team and must include acknowledgement of all authors and grant funding. Mary’s team must also be notified of any errors the data entry of label Nutrition Facts table and Ingredient values. *University of Toronto Food Label Information and Price (FLIP)© database formerly known as “Food Label Information Program”.
            </Typography>
            <br/>
            <Typography variant='body1'>
            Since 2010, the L’Abbé Lab has maintained a database of packaged foods that is updated every 3-4 years for monitoring and testing hypotheses related to the Canadian food supply. The FLIP underwent its most recent collection in 2020. The FLIP contains food label information for more than 80,000 food products from top food retailers in Canada. This data allows for in-depth nutritional analyses of the Canadian food supply spanning 10 years. The 2017 collection includes pictures and food information off labels from Sobeys, Loblaws and Metro in Toronto. <br/>
            For more imformation on the FLIP database, please visit the University of Toronto’s 
            <a href="https://labbelab.utoronto.ca/projects/the-canadian-food-supply/" target="_blank" rel="noreferrer"> L’Abbé Lab website</a>.
            </Typography>
            
            
          </div>
        </DataInfoContainer>
      </div>
        
    </AboutPageContainer>
  )
}

export default About