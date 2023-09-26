import { Slider } from "@mui/material"
import { styled } from "@mui/material/styles"


const CustomSlider = styled(Slider)(() => ({
    ".MuiSlider-thumb": {
        transition: "none"
    },
    ".MuiSlider-track": {
        transition: "none"
    },
    "span": {
        transition: "none"
    }
}));

const InputRange = ({min, max, onChange}) => {

    const tickMarks = [0, 20, 40, 60, 80, 100].map(num => ({value: num, label: `${num}%`}))
    return (
        <div>
            <CustomSlider 
                getAriaLabel={() => "Custom marks"} 
                marks={tickMarks} 
                value={[min, max]}
                onChange={onChange}
            />
        </div>
    )

}

export default InputRange;