import { styled } from "@mui/system"
import { gridClasses } from '@mui/x-data-grid'


export default styled("div")(({ theme }) => ({
    fontSize: theme.typography.fontSize * 1.2,
    [`& .${gridClasses.row}.odd`]: {
        backgroundColor: "white",
        "&:hover, &.Mui-hovered": {
            backgroundColor: theme.palette.grey[400]
        }
    },
    [`& .${gridClasses.row}.even`]: {
        backgroundColor: theme.palette.grey[100],
        "&:hover, &.Mui-hovered": {
            backgroundColor: theme.palette.grey[400]
        }
    },
    [`.${gridClasses.columnHeaderTitle}`]: {
        fontWeight: "bold",
        fontSize: theme.typography.fontSize * 1.5,
        padding: theme.spacing(1)
    },
    [`& .${gridClasses.cell}`]: {
        padding: theme.spacing(2),
        alignItems: "start",
        wordWrap: "break-word",
        whiteSpace: "normal"
    }
}));