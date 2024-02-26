import { createTheme } from "@mui/material";

const Theme = createTheme({
    palette: {
        primary: {
            main: "rgb(115, 44, 2)",
            dark: "rgb(115, 44, 2)",
            light: "#D9B166",
            transparent: {
                light: "#D9B16633"
            },
        },
        // the landing page background colour
        landing: {
            main: "#F1F1F1"
        },
        action: {
            main: "#BF6B04",
        },
    },
    typography: {
        fontFamily: [
            "K2D"
        ]
    },
    page: {
        content: {
            max: 1300
        }
    }
})

export default Theme;