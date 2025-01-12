import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#f8f9fa',
    },
  },
  typography: {
    fontSize: 13,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '13px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          padding: '8px',
        },
      },
    },
  },
});

export default theme; 