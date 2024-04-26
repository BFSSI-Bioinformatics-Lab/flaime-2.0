import { useAutocomplete } from '@mui/base/useAutocomplete';
import { Typography, Tooltip, IconButton, Box, Chip, Stack } from "@mui/material";
import { useState, useEffect, useContext, useReducer } from 'react';
import { HelpTooltipIcon } from "../../globalStyles";
import { 
    TextListInputField, 
    TextListInputListbox, 
    AdditionalOptionsIconContainer, 
    TextListInputFieldContainer, 
    TextListInputContainer, 
    AdditionalOptionsIcon, 
    AdditionalOptionsButton, 
    AdditionalOptionsMenuItem,
    AdditionalOptionsMenu  } from './styles';


export function TextListInput({title, category= [], placeholder, additionalOptions = [], inputWidth = "300px", helpTxt="", attachments = [], onAttachmentDelete=null, onTextChange=null}) {
    const categoryOptions = category ?? [];
    additionalOptions = additionalOptions ?? [];
    const [inputAttachments, setInputAttachments] = useState(attachments);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    // get the needed values to custom make an autocomplete input
    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
      } = useAutocomplete({
        id: 'use-autocomplete-demo',
        options: categoryOptions,
        getOptionLabel: (option) => option,
        freeSolo: true
      });

    // modify the focus/unfocus events for the autocomplete input
    const inputProps = getInputProps();
    const inputOnFocus = inputProps.onFocus;
    const inputOnFocusOut = inputProps.onBlur;

    inputProps.onFocus = (event) => {
        inputOnFocus(event);
        focusInput();
    };

    inputProps.onBlur = (event) => {
        inputOnFocusOut(event);
        unFocusInput();
    }

    const [containerBorderWidth, setContainerBorderWidth] = useState("1px");
    const [additionalOptAnchorEl, setAdditionalOptAnchorEl] = useState(null);
    const additionalMenuIsOpen = Boolean(additionalOptAnchorEl);

    return (
    <div>
        <div {...getRootProps()}>
            <Box sx={{display: "flex"}}>
                { title !== undefined ? (<Typography variant="h5">{title}</Typography>) : null}
                { helpTxt !== "" ? (
                <Tooltip title={helpTxt} arrow>
                    <IconButton>
                    <HelpTooltipIcon />
                    </IconButton>
                </Tooltip>) : null}
            </Box>
            <Stack direction="row" spacing={1}>
                {inputAttachments.map((attachment, ind) => {
                    return <Chip label={attachment} onDelete={() => {
                        onAttachmentDelete(attachment, ind);
                        forceUpdate();
                    }}/>
                })}
            </Stack>
            <TextListInputContainer sx={{'border-width': containerBorderWidth, width: inputWidth}}>
                <AdditionalOptionsIconContainer>
                    <AdditionalOptionsButton 
                        id="additional-button"
                        aria-controls={additionalMenuIsOpen ? 'additional-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={additionalMenuIsOpen ? 'true' : undefined}
                        onClick={additionalOptMenuOpen}
                >
                        <AdditionalOptionsIcon  />
                    </AdditionalOptionsButton>
                    <AdditionalOptionsMenu
                        id="additional-menu"
                        anchorEl={additionalOptAnchorEl}
                        open={additionalMenuIsOpen}
                        onClose={additionalOptMenuClose}
                        disableAutoFocus={true}
                        MenuListProps={{
                            'aria-labelledby': 'additional-button',
                        }}
                    >
                    { additionalOptions.map((option) => {
                        const innerComponent = option.component ?? option.title;
                        const onClick = option.onClick ?? null;
                        return <AdditionalOptionsMenuItem onClick={onClick}>{innerComponent}</AdditionalOptionsMenuItem>
                    })}
                    </AdditionalOptionsMenu>
                </AdditionalOptionsIconContainer>
                <TextListInputFieldContainer>
                    <TextListInputField {...inputProps} placeholder={placeholder} onInput={onTextChange}/>
                </TextListInputFieldContainer>
                {groupedOptions.length > 0 ? (
                    <TextListInputListbox {...getListboxProps()}>
                        {groupedOptions.map((option, index) => (
                            <li {...getOptionProps({ option, index })}>{option}</li>
                        ))}
                    </TextListInputListbox> ) : null}
            </TextListInputContainer>
        </div>
    </div>
    );


    function focusInput() {
        setContainerBorderWidth("2px");
    }

    function unFocusInput() {
        setContainerBorderWidth("1px");
    }

    function additionalOptMenuOpen(event) {
        setAdditionalOptAnchorEl(event.currentTarget);
    }

    function additionalOptMenuClose(event) {
        setAdditionalOptAnchorEl(null);
    }
}