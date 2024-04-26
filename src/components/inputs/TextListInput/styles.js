import { styled } from "@mui/system";
import { Button, MenuItem, Menu } from "@mui/material";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { IoAddCircle } from "react-icons/io5";


export const TextListInputContainer = styled('div')(({ theme }) => ({
    minWidth: "100px",
    display: 'flex',
    borderRadius: '5px',
    border: `1px solid ${theme.palette.primary.dark}`,
    position: 'relative'
}));

export const AdditionalOptionsIconContainer = styled('div')(({theme}) => ({
    float: 'left',
    position: 'relative',
    padding: '5px 15px'
}));

export const AdditionalOptionsButton = styled(Button)({
    position: 'absolute',
    top: '18px',
    msTransform: "translate(-50%, -50%)",
    transform: "translate(-50%, -50%)",
    padding: 0,
    minWidth: 0
});

export const AdditionalOptionsIcon = styled(IoAddCircle)(({ theme }) => ({
    color: theme.palette.primary.dark,
    width: "20px",
    height: "20px",

    "&:hover": {
        color: theme.palette.primary.light
    }
}));

export const AdditionalOptionsMenu = styled(Menu)(({theme}) => ({
    margin: 0,
    padding: 0,

    "& ul": {
        padding: 0
    },

    "& ul li": {
        padding: 0
    }
}));

export const AdditionalOptionsMenuItem = styled(MenuItem)(({theme}) => ({
    padding:0,
    margin:0,
    backgroundColor: theme.palette.primary.contrastText,
   "&:hover": {
        backgroundColor: theme.palette.primary.light
   },
    "&:focus *": {
        color: theme.palette.primary.dark
   },
   "&:focus > div": {
        backgroundColor: 'transparent'
    },
    "&:focus > div > *": {
        backgroundColor: 'transparent'
    }
}));

export const TextListInputFieldContainer = styled('div')({
    float: 'left',
    width: '100%',
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '300px'
});

export const TextListInputField = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    color: ${theme.palette.primary.dark};
    background: ${theme.palette.primary.contrastText};
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
    backgroundColor: theme.palette.primary.contrastText,
    overflow: 'auto',
    maxHeight: 200,
    top: '100%',
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