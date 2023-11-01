import { styled } from "@mui/system";

export default styled("div")(({theme}) => ({
    "& .MuiInputBase-input.Mui-disabled": {
        color: theme.palette.primary.dark,
        "-webkit-text-fill-color": theme.palette.primary.dark
    }
}));