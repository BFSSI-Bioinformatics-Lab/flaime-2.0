import { Container } from '@mui/system'
import React from 'react'
import { Image } from 'mui-image'
import landing from "../static/images/landing.jpg"
import { Typography } from '@mui/material'




const Home = () => {
  return (
    <div>
      <div className='landing-img' style={{ position: "relative" }}>
        <Image src={landing} height='550px' duration={0} easing='ease' opacity={0.5}></Image>
        
        <Typography variant="h2"  style={{position: "absolute", color: "#732C02",top: '30%',left: "25%",transform: "translateX(-60%)",}}>FLAIME</Typography>
        <Typography  style={{position: "absolute", color: "#732C02",top: '50%',left: "45%",transform: "translateX(-58%)",}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nibh nisl condimentum id venenatis a condimentum vitae. Non pulvinar neque laoreet suspendisse interdum.
        </Typography>
      </div>
      
      <Container>
        <h2>Home Page</h2>
      </Container>
      
    </div>
  )
}

export default Home