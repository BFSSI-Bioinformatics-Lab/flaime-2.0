import { createTheme } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: "rgb(115, 44, 2)",
            dark: "rgb(115, 44, 2)",
            light: "#D9B166"
        },
        // the landing page background colour
        landing: {
            main: "#F1F1F1"
        }
    },
    typography: {
        fontFamily: [
            "K2D"
        ]
    }
})

export default theme;