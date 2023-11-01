import { Slider } from "@mui/material";
import Styled from "./styles";

const MultiSlider = ({min, max, onChange, tickMarks}) => {
    return (
        <Styled>
            <Slider 
                getAriaLabel={() => "Custom marks"} 
                marks={tickMarks} 
                value={[min, max]}
                onChange={onChange}
            />
        </Styled>
    )
}

export default MultiSlider;