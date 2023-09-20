import { Autocomplete, TextField, Typography, Grid } from "@mui/material";

const SearchFilter = ({categories, onInputChange}) => {

    return (
        <>
            <Grid container spacing={3}>
                {categories.map(category => (
                    <Grid item xs={category.multiple ? 7 : 6} md={category.multiple ? 4 : 3}>
                        <div>
                            <Typography variant="subtitle1">{category.title}</Typography>
                            <Autocomplete 
                                freeSolo
                                id={category.title}
                                options={category.options}
                                size={category.multiple ? "medium" : "small"}
                                multiple={category.multiple}
                                onInputChange={(e, val) => onInputChange(category.title, e, val)}
                                renderInput={(params => <TextField {...params} />)}
                            />
                        </div>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

export default SearchFilter;