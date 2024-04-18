import { styled } from "@mui/system";
import { Button } from "@mui/material";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { IoAddCircle } from "react-icons/io5";


export const TextListInputContainer = styled('div')(({ theme }) => ({
    width: '300px',
    display: 'flex',
    "border-radius": '5px',
    border: `1px solid ${theme.palette.primary.dark}`
}));

export const AdditionalOptionsIconContainer = styled('div')({
    float: 'left',
    position: 'relative',
    padding: '5px 15px'
});

export const AdditionalOptionsButton = styled(Button)({
    position: 'absolute',
    top: '17px',
    "-ms-transform": "translate(-50%, -50%)",
    transform: "translate(-50%, -50%)",
    padding: 0,
    'min-width': 0
});

export const AdditionalOptionsIcon = styled(IoAddCircle)(({ theme }) => ({
    color: theme.palette.primary.dark,
}));

export const TextListInputFieldContainer = styled('div')({
    float: 'left',
    width: '100%',
    position: 'relative',
    'overflow-y': 'auto',
    'overflow-x': 'hidden',
    'max-height': '300px'
});

export const TextListInputField = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    color: ${theme.palette.mode === 'light' ? '#000' : '#fff'};
    background: ${theme.palette.mode === 'light' ? '#fff' : '#000'};
    border-style: none;
    resize: none;

    &:focus {
      outline: none;
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
);

export const TextListInputListbox = styled('ul')(({ theme }) => ({
    width: '100%',
    margin: 0,
    padding: 0,
    zIndex: 1,
    position: 'absolute',
    listStyle: 'none',
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#000',
    overflow: 'auto',
    maxHeight: 200,
    border: '1px solid rgba(0,0,0,.25)',
    '& li.Mui-focused': {
      backgroundColor: '#4a8df6',
      color: 'white',
      cursor: 'pointer',
    },
    '& li:active': {
      backgroundColor: '#2977f5',
      color: 'white',
    },
  }));