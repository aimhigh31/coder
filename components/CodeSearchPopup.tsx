import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StyledTableCell, StyledTextField, FilterGroup, SearchButton } from '../styles/components';
import { useState, useEffect } from 'react';
import { CodeItem } from '../types/interfaces';

interface CodeSearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  codeItems: CodeItem[];
}

export default function CodeSearchPopup({ open, onClose, onSelect, codeItems }: CodeSearchPopupProps) {
  const [filters, setFilters] = useState({
    industry: '',
    model: '',
    electronicCode: '',
    status: '',
  });
  const [filteredItems, setFilteredItems] = useState<CodeItem[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;  // 페이지당 6개 행

  // codeItems가 변경될 때마다 filteredItems 업데이트
  useEffect(() => {
    setFilteredItems(codeItems);
  }, [codeItems]);

  // 현재 페이지에 표시할 아이템들
  const displayedItems = filteredItems.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = () => {
    const filtered = codeItems.filter(item => {
      return (
        (!filters.industry || item.industry.includes(filters.industry)) &&
        (!filters.model || item.model.includes(filters.model)) &&
        (!filters.electronicCode || item.electronicCode.includes(filters.electronicCode)) &&
        (!filters.status || item.status === filters.status)
      );
    });
    setFilteredItems(filtered);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        전산코드 검색
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* 필터 영역을 한 줄로 정렬 */}
          <Grid item xs={12} container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
            <Grid item xs={2}>
              <FilterGroup>
                <InputLabel>산업군</InputLabel>
                <StyledTextField
                  fullWidth
                  size="small"
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                />
              </FilterGroup>
            </Grid>
            <Grid item xs={2}>
              <FilterGroup>
                <InputLabel>모델</InputLabel>
                <StyledTextField
                  fullWidth
                  size="small"
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                />
              </FilterGroup>
            </Grid>
            <Grid item xs={3}>
              <FilterGroup>
                <InputLabel>전산코드</InputLabel>
                <StyledTextField
                  fullWidth
                  size="small"
                  value={filters.electronicCode}
                  onChange={(e) => setFilters({ ...filters, electronicCode: e.target.value })}
                />
              </FilterGroup>
            </Grid>
            <Grid item xs={3}>
              <FilterGroup>
                <InputLabel>양산/개발</InputLabel>
                <StyledTextField
                  fullWidth
                  size="small"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                />
              </FilterGroup>
            </Grid>
            <Grid item xs={2}>
              <SearchButton variant="contained" onClick={handleSearch} fullWidth>
                조회
              </SearchButton>
            </Grid>
          </Grid>

          {/* 테이블 영역 */}
          <Grid item xs={12}>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>선택</StyledTableCell>
                    <StyledTableCell>NO</StyledTableCell>
                    <StyledTableCell>산업군</StyledTableCell>
                    <StyledTableCell>모델</StyledTableCell>
                    <StyledTableCell>전산코드</StyledTableCell>
                    <StyledTableCell>품목명</StyledTableCell>
                    <StyledTableCell>양산/개발</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedItems.map((item, index) => (
                    <TableRow key={index} hover>
                      <StyledTableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            onSelect(item.electronicCode);
                            onClose();
                          }}
                        >
                          확인
                        </Button>
                      </StyledTableCell>
                      <StyledTableCell>{(page - 1) * rowsPerPage + index + 1}</StyledTableCell>
                      <StyledTableCell>{item.industry}</StyledTableCell>
                      <StyledTableCell>{item.model}</StyledTableCell>
                      <StyledTableCell>{item.electronicCode}</StyledTableCell>
                      <StyledTableCell>{item.itemName}</StyledTableCell>
                      <StyledTableCell>{item.status}</StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
} 