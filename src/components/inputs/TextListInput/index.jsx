import { useAutocomplete } from '@mui/base/useAutocomplete';
import { Typography } from "@mui/material";
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { TextListInputField, TextListInputListbox, AdditionalOptionsIconContainer, TextListInputFieldContainer, TextListInputContainer, AdditionalOptionsIcon, AdditionalOptionsButton } from './styles';


function TextListInput({category, placeholder, additionalOptions}) {
    const categoryOptions = category.options ?? [];
    additionalOptions = additionalOptions ?? [];

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
        getOptionLabel: (option) => option
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
            <Typography variant="h5" {...getInputLabelProps()}>{category.title}</Typography>
            <TextListInputContainer sx={{'border-width': containerBorderWidth}}>
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
                    <Menu
                        id="additional-menu"
                        anchorEl={additionalOptAnchorEl}
                        open={additionalMenuIsOpen}
                        onClose={additionalOptMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'additional-button',
                        }}
                    >
                    { additionalOptions.length > 0 ? (
                        additionalOptions.map((option) => (
                            <MenuItem onClick={option.onClick}>{option.title}</MenuItem>
                        ))
                    ) : null}
                    </Menu>
                </AdditionalOptionsIconContainer>
                <TextListInputFieldContainer>
                    <TextListInputField {...inputProps} placeholder={placeholder}/>
                    {groupedOptions.length > 0 ? (
                    <TextListInputListbox {...getListboxProps()}>
                        {groupedOptions.map((option, index) => (
                            <li {...getOptionProps({ option, index })}>{option}</li>
                        ))}
                    </TextListInputListbox>
                    ) : null}
                </TextListInputFieldContainer>
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

export default TextListInput;