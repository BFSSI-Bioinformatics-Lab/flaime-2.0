import { Box, Container, Paper, Typography, IconButton, Card } from "@mui/material";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";
import quickSearch from "../../static/images/singin.jpg";
import quicklinks from "../../static/images/quickLinks.jpg"
import ArrowCircleRight from "@mui/icons-material/ArrowCircleRight";

export const ExploreItem = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    textAlign: 'center',
    color: theme.palette.primary.dark,
    height:'177px',
    width: '360px',
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: '24px',
    fontSize: "30px"
  }));
  
export const ArrowButtonLink = styled(Link)(({ theme }) => ({
    color: theme.palette.primary.light,
    fontSize: 0,
  }));
  
export const ArrowButton = styled(IconButton)(() => ({
    position: "absolute",
    transform: "translate(310px, 60px)",
}));
  
export const ShoppingCartIcon = styled(ShoppingCart)(() => ({
    fontSize: 77
}))

export const HomePageContainer = styled("div")(({theme}) => ({
    backgroundColor: theme.palette.landing.main
}))

export const PageTitleTypography = styled(Typography)(() => ({
    position: "absolute", 
    color: "rgb(115, 44, 2)",
    top: '25%',
    left: "25%",
    transform: "translateX(-60%)"
}));

export const PageDescriptionTypography = styled(Typography)(() => ({
    position: "absolute", 
    color: "#732C02",
    top: '45%',
    left: "45%",
    transform: "translateX(-58%)"
}));

export const SearchBarContainer = styled(Box)(() => ({
    height: "335px", 
    backgroundImage:`url(${quickSearch})`, 
    backgroundRepeat: "no-repeat", 
    backgroundSize: "cover", 
    backgroundPosition: "80% 50%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center"
}))

export const DataSourceContainer = styled(Box)(() => ({
    height: "370px", 
    display: "flex",
    flexDirection: "column", 
    alignItems: "center", 
    // justifyContent: "space-between",
    marginBottom: "30px",
    // marginTop: "15px"
}))

export const DataCard = styled(Card)(({ theme }) => ({
    // height: "110px",
    backgroundColor: theme.palette.landing.main,
    boxShadow: "none",
    paddingBottom: "0px",
    // width: "200px", 
    // display: "flex", 
    // flexDirection: "column", 
    // alignItems: "center", 
    // justifyContent: "space-evenly"
}))     

export const HeadingContainer = styled(Container)(() => ({
    padding: "25px"
}))

export const ExploreSectionContainer = styled("div")(() => ({
    backgroundImage:`url(${quicklinks})`, 
    backgroundRepeat: "no-repeat", 
    backgroundSize: "cover"
}))

export const ExploreSectionBox = styled(Box)(() => ({
    minHeight: "50vh", 
    backgroundColor: 'rgba(241, 241, 241, 0.4)', 
    padding: "2vh 0"
}))

export const ExploreItemTitleTypography = styled(Typography)(() => ({
    margin: "0 42px"
}))

export const ArrowCircleRightIcon = styled(ArrowCircleRight)(() => ({
    fontSize: 44
}))