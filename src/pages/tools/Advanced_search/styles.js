import { Box, Button, Grid } from "@mui/material";
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

