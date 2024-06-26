import { Button} from "@mui/material";
import { styled } from "@mui/system";

export const ResetButton = styled(Button)(({ theme }) => ({
    color: 'white',
    backgroundColor: theme.palette.primary.dark,
  }));