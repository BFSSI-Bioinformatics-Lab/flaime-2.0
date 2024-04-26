import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useState } from "react";
import { Typography, Box, Tooltip, IconButton } from '@mui/material'
import { DatePickerContainer, DateBetweenText, DateBetweenTextContainer, DatePickerInput } from './styles';
import { HelpTooltipIcon } from "../../globalStyles";


function DateRangePicker({title, onChange = null, startDatePlaceHolder="Start Date", endDatePlaceHolder="End Date", sx={}, helpTxt=""} = {}) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    return(
        <Box sx={sx}>
            <Box sx={{display: "flex"}}>
                { title !== undefined ? (<Typography variant="h5">{title}</Typography>) : null}
                { helpTxt !== "" ? (
                <Tooltip title={helpTxt} arrow>
                    <IconButton>
                    <HelpTooltipIcon />
                    </IconButton>
                </Tooltip>) : null}
            </Box>
            <DatePickerContainer>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePickerInput label={startDatePlaceHolder} value={startDate} onChange={onStartDateChange}/>
                    <DateBetweenTextContainer>
                        <DateBetweenText variant="span"> To </DateBetweenText>
                    </DateBetweenTextContainer>
                    <DatePickerInput label={endDatePlaceHolder} value={endDate} onChange={onEndDateChange}/>
                </LocalizationProvider>
            </DatePickerContainer>
        </Box>
    );

    function onStartDateChange(newStartDate) {
        if (!newStartDate.isValid()) {
            newStartDate = null;
        }

        setStartDate(newStartDate);
        if (onChange) {
            onChange(newStartDate, endDate);
        }
    }

    function onEndDateChange(newEndDate) {
        if (!newEndDate.isValid()) {
            newEndDate = null;
        }

        setEndDate(newEndDate);
        if (onChange) {
            onChange(startDate, newEndDate);
        }
    }
}

export default DateRangePicker;