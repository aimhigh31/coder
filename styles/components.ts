import { styled } from '@mui/material/styles';
import { TableCell, Select, TextField, Box, Button, TableContainer, ButtonProps, Grid, Container, Paper } from '@mui/material';

interface StyledTableCellProps {
  className?: string;
  padding?: 'checkbox' | 'none' | 'normal';
}

export const StyledTableCell = styled(TableCell)<StyledTableCellProps>(
  ({ theme }) => ({
    fontSize: '13px',
    padding: '4px 8px',
    whiteSpace: 'nowrap',
    border: `0.25px solid #eeeeee`,
    height: '40px',
    '&.MuiTableCell-head': {
      backgroundColor: '#f5f5f5',
      fontWeight: 500,
    },
    '&.electronic-code': {
      width: '180px',
      minWidth: '180px',
      maxWidth: '180px',
      backgroundColor: '#e3f2fd',
    },
    '&.item-type': {
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
    },
    '&.item-name': {
      width: '300px',
      minWidth: '300px',
    }
  })
);

export const StyledSelect = styled(Select)({
  fontSize: '13px',
  '& .MuiSelect-select': {
    padding: '2px 6px',
    height: '31px',
  }
});

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '35px',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: '#9CA3AF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6B7280',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
    padding: '8px 14px',
  }
});

export const FilterGroup = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  '& .MuiInputLabel-root': {
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
  },
});

export const ControlButton = styled(Button)(({ theme }) => ({
  marginLeft: '8px',
  fontSize: '13px',
}));

export const ExcelButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: '8px',
  fontSize: '13px',
  backgroundColor: '#4caf50',
  color: 'white',
  '&:hover': {
    backgroundColor: '#388e3c',
  },
}));

export const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
});

export const TableWrapper = styled(Box)({
  position: 'relative',
  height: '660px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  border: '1px solid #eeeeee',
  borderRadius: '4px',
});

export const SearchButton = styled(Button)(({ theme }) => ({
  height: '31px',
  backgroundColor: '#6c757d',
  color: 'white',
  minWidth: '120px',
  '&:hover': {
    backgroundColor: '#5a6268',
  },
}));

export const HiddenInput = styled('input')({
  display: 'none'
});

export const TableContainerStyled = styled(TableContainer)({
  height: '600px',
  maxHeight: '600px',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#bdbdbd',
    borderRadius: '4px',
  },
});

export const PaginationBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  padding: '16px 0',
  backgroundColor: '#fff',
  borderTop: '1px solid #eeeeee',
  marginTop: 'auto',
});

export const ErrorBox = styled(Box)(({ theme }) => ({
  color: theme.palette.error.main,
  textAlign: 'center',
  margin: '16px 0'
}));

export const FilterContainer = styled(Grid)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: '8px 16px',
  marginBottom: '2.0px',
  justifyContent: 'space-between',
}));

export const FilterSelect = styled(Select)({
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-root': {
    height: '35px',
  },
  '& .MuiSelect-select': {
    fontSize: '14px',
    padding: '8px 14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9CA3AF',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6B7280',
  }
});

export const ButtonContainer = styled(Grid)(({ theme }) => ({
  display: 'flex', 
  justifyContent: 'flex-end', 
  gap: '8px',
  marginBottom: '8px',
})); 