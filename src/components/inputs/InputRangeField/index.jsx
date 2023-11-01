import { TextField, FormLabel } from "@mui/material"
import Styled from "./styles"

const InputRangeField = ({label, value}) => {
    return (
        <Styled>
            <FormLabel color="primary">{label}</FormLabel>
             <TextField disabled fullWidth variant="filled" color="primary.dark" size="small" value={value} />
        </Styled>
    )
}

export default InputRangeField;