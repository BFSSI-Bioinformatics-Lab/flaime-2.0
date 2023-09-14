import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { styled } from "@mui/system";

const SearchBar = ({placeholder}) => {
    
    const SearchBarTextField = styled(TextField)(({theme}) => ({
        width: "452px",
        height: "75px",
        justifyContent: "center",
        color: theme.palette.primary.dark,
        backgroundColor: theme.palette.grey[100],
        borderRadius: "24px",
        "& input": {
          fontSize: theme.typography.fontSize * 1.8,
          textAlign: "center",
          "::placeholder": {
            color: theme.palette.primary.dark,
            opacity: 1
          },
          "::-ms-input-placeholder": {
            color: theme.palette.primary.dark,
            opacity: 1
          },
          ":-ms-input-placeholder": {
            color: theme.palette.primary.dark,
            opacity: 1
          }
        },
        "& fieldset": {
          border: "none"
        },
      }));

    return (
        <SearchBarTextField 
            placeholder={placeholder}
            variant="outlined"
            InputProps={{
                endAdornment: <InputAdornment><SearchIcon fontSize="large" color="primary" /></InputAdornment>
            }}
        />
    )
}

export default SearchBar;