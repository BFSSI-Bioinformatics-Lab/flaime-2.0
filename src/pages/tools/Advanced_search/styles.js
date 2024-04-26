import { Box, Button, Grid, AccordionSummary } from "@mui/material";
import { styled } from "@mui/system";

export const AdvancedSearchSection = styled(Box)(({theme}) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
}));

export const AddNutrientButton = styled(Button)(() => ({
    fontSize: 16,
    marginBottom: 5
}));

export const SearchButton = styled(Button)(() => ({
    fontSize: 16
}));

export const NutrientFiltersGrid = styled(Grid)(() => ({
    paddingBottom: 2
}));

export const FileUploadContainer = styled("div")(({theme}) => ({
    padding: '10px',
    "&:hover > *": {
        backgroundColor: theme.palette.primary.light
    }
}))

export const FileUploadInput = styled("input")(() => ({
    display: 'none'
}));

export const FileUploadButton = styled("label")(({theme}) => ({
    backgroundColor: theme.palette.primary.contrastText,
}));

export const FilterCollapsibleSummary = styled(AccordionSummary)(({theme}) => ({
    marginTop: "10px"
}));

export const FilterStyles = {
    marginBottom: '30px'
}

export const CategorySearchStyle = {
    marginTop: '30px',
    marginBottom: '50px'
}