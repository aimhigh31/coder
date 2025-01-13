import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '13px',
  padding: '8px',
  whiteSpace: 'nowrap',
  border: `0.25px solid #eeeeee`,
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
  },
  '&.MuiTableCell-head': {
    backgroundColor: '#f5f5f5',
    fontWeight: 500,
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  fontSize: '13px',
  '& .MuiSelect-select': {
    padding: '6px',
  },
  '&.revision-select': {
    '& .MuiMenu-paper': {
      maxHeight: '200px'
    }
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '13px',
    padding: '6px',
  },
}));

const FilterGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}));

const ControlButton = styled(Button)(({ theme }) => ({
  marginLeft: '8px',
  fontSize: '13px',
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
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
}));

const TableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '400px',
}));

const SearchButton = styled(Button)(({ theme }) => ({
  height: '31px',
  backgroundColor: '#6c757d',
  minWidth: '120px',
  '&:hover': {
    backgroundColor: '#5a6268',
  },
}));

export default function NexplusCoder() {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    industry: '',
    division: '',
    partGroup: '',
    code: '',
    name: '',
    model: '',
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [originalRows, setOriginalRows] = useState<any[]>([]);

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const displayedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/items');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch items');
      }
      
      setOriginalRows(result.data);
      setRows(result.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string) => (event: any) => {
    const newFilters = {
      ...filters,
      [field]: event.target.value
    };
    setFilters(newFilters);

    if (Object.values(newFilters).every(value => !value)) {
      setRows(originalRows);
    } else {
      const filteredRows = originalRows.filter(row => {
        const matchIndustry = !newFilters.industry || row.industry === newFilters.industry;
        const matchDivision = !newFilters.division || row.division === newFilters.division;
        const matchPartGroup = !newFilters.partGroup || row.partGroup === newFilters.partGroup;
        const matchCode = !newFilters.code || 
          row.electronicCode?.toLowerCase().includes(newFilters.code.toLowerCase());
        const matchName = !newFilters.name || 
          row.itemName?.toLowerCase().includes(newFilters.name.toLowerCase());
        const matchModel = !newFilters.model || 
          row.model?.toLowerCase().includes(newFilters.model.toLowerCase());

        return matchIndustry && matchDivision && matchPartGroup && 
               matchCode && matchName && matchModel;
      });
      setRows(filteredRows);
    }
  };

  const filterItems = () => {
    if (Object.values(filters).every(value => !value)) {
      setRows(originalRows);
      return;
    }

    const filteredRows = originalRows.filter(row => {
      const matchIndustry = !filters.industry || row.industry === filters.industry;
      const matchDivision = !filters.division || row.division === filters.division;
      const matchPartGroup = !filters.partGroup || row.partGroup === filters.partGroup;
      const matchCode = !filters.code || 
        row.electronicCode?.toLowerCase().includes(filters.code.toLowerCase());
      const matchName = !filters.name || 
        row.itemName?.toLowerCase().includes(filters.name.toLowerCase());
      const matchModel = !filters.model || 
        row.model?.toLowerCase().includes(filters.model.toLowerCase());

      return matchIndustry && matchDivision && matchPartGroup && 
             matchCode && matchName && matchModel;
    });

    setRows(filteredRows);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
  };

  const addRow = async () => {
    setLoading(true);
    setError(null);
    try {
      const newRow = {
        no: rows.length + 1,
        datetime: getCurrentDateTime(),
        division: 'A',
        industry: 'E',
        partGroup: 'A00',
        revision: 'A',
        itemType: '제품',
        status: '양산',
        unit: 'EA',
      };

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add item');
      }

      setRows(prev => [result.data, ...prev]);
    } catch (error) {
      console.error('Failed to add item:', error);
      setError(error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedRows = async () => {
    try {
      await Promise.all(
        selectedRows.map((id) =>
          fetch(`/api/items/${id}`, {
            method: 'DELETE',
          })
        )
      );
      setRows((prev) => prev.filter((row) => !selectedRows.includes(row._id)));
      setSelectedRows([]);
    } catch (error) {
      console.error('Failed to remove items:', error);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all(
        rows.map((row) =>
          fetch(`/api/items/${row._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(row),
          })
        )
      );
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save items:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
    XLSX.writeFile(workbook, 'nexplus_coder_data.xlsx');
  };

  const importExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        try {
          const response = await fetch('/api/items/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
          });

          if (response.ok) {
            fetchItems();
          }
        } catch (error) {
          console.error('Failed to import excel:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(rows.map((row) => row._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowChange = async (id: string, field: string, value: any) => {
    setRows(prev => prev.map(row => {
      if (row._id === id) {
        const updatedRow = { ...row, [field]: value };
        if (['division', 'industry', 'partGroup', 'revision'].includes(field)) {
          updatedRow.electronicCode = `${updatedRow.division}-${updatedRow.industry}-${updatedRow.partGroup}-${String(updatedRow.no).padStart(5, '0')}${updatedRow.revision}`;
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const resetFilters = () => {
    setFilters({
      industry: '',
      division: '',
      partGroup: '',
      code: '',
      name: '',
      model: '',
    });
    setRows(originalRows);
  };

  return (
    <Container maxWidth={false} sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2, textAlign: 'right' }}>
        <Typography variant="h5" color="primary">
          NEXPLUS CODER 1.0
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {error && (
          <Box sx={{ color: 'error.main', textAlign: 'center', my: 2 }}>
            {error}
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>산업군</InputLabel>
                  <FormControl fullWidth size="small">
                    <StyledSelect value={filters.industry} onChange={handleFilterChange('industry')}>
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="E">E 전기차</MenuItem>
                      <MenuItem value="H">H 수소</MenuItem>
                      <MenuItem value="I">I IT</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>대분류</InputLabel>
                  <FormControl fullWidth size="small">
                    <StyledSelect value={filters.division} onChange={handleFilterChange('division')}>
                      <MenuItem value="">전체</MenuItem>
                      {['A', 'B', 'C', 'D', 'E'].map(div => (
                        <MenuItem key={div} value={div}>{div}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>부품군</InputLabel>
                  <FormControl fullWidth size="small">
                    <StyledSelect value={filters.partGroup} onChange={handleFilterChange('partGroup')}>
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="A00">A00 S/Can</MenuItem>
                      <MenuItem value="B00">B00 Busbar</MenuItem>
                      <MenuItem value="C00">C00 Connector</MenuItem>
                      <MenuItem value="D00">D00 DummyPlate</MenuItem>
                      <MenuItem value="E00">E00 EndPlate</MenuItem>
                      <MenuItem value="F00">F00 Foldable</MenuItem>
                      <MenuItem value="G00">G00 Slidable</MenuItem>
                      <MenuItem value="R00">R00 Rollable</MenuItem>
                      <MenuItem value="P00">P00 PorousPlate</MenuItem>
                      <MenuItem value="S00">S00 SidePlate</MenuItem>
                      <MenuItem value="T00">T00 Tab</MenuItem>
                      <MenuItem value="U00">U00 Cell</MenuItem>
                      <MenuItem value="V00">V00 BP</MenuItem>
                      <MenuItem value="X00">X00 기타</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>전산코드</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.code}
                    onChange={handleFilterChange('code')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>품목명</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.name}
                    onChange={handleFilterChange('name')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel>모델</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.model}
                    onChange={handleFilterChange('model')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.2}>
                <SearchButton variant="contained" onClick={filterItems} fullWidth>
                  조회
                </SearchButton>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <ControlButton variant="contained" onClick={addRow}>행 추가</ControlButton>
            <ControlButton variant="contained" onClick={removeSelectedRows}>행 제거</ControlButton>
            <ControlButton variant="contained" onClick={saveData}>저장</ControlButton>
            <ControlButton variant="contained" onClick={exportToExcel}>엑셀 다운로드</ControlButton>
            <input
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="excel-upload"
              onChange={importExcel}
            />
            <ControlButton
              variant="contained"
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              엑셀 업로드
            </ControlButton>
          </Grid>

          <Grid item xs={12}>
            <TableWrapper>
              {loading && (
                <LoadingOverlay>
                  <CircularProgress />
                </LoadingOverlay>
              )}
              <TableContainer sx={{ minHeight: '400px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.length === rows.length}
                          onChange={handleSelectAll}
                        />
                      </StyledTableCell>
                      <StyledTableCell>NO</StyledTableCell>
                      <StyledTableCell>등록일시</StyledTableCell>
                      <StyledTableCell className="electronic-code">전산코드</StyledTableCell>
                      <StyledTableCell>대분류</StyledTableCell>
                      <StyledTableCell>산업군</StyledTableCell>
                      <StyledTableCell>부품군</StyledTableCell>
                      <StyledTableCell>리비전</StyledTableCell>
                      <StyledTableCell className="item-name">품목명</StyledTableCell>
                      <StyledTableCell className="item-type">품목유형</StyledTableCell>
                      <StyledTableCell>양산/개발</StyledTableCell>
                      <StyledTableCell>단위</StyledTableCell>
                      <StyledTableCell>모델</StyledTableCell>
                      <StyledTableCell>회계코드</StyledTableCell>
                      <StyledTableCell>비고</StyledTableCell>
                      <StyledTableCell>작성자</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRows.map((row) => (
                      <TableRow key={row._id}>
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.includes(row._id)}
                            onChange={() => handleRowSelect(row._id)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>{row.no}</StyledTableCell>
                        <StyledTableCell>{row.datetime}</StyledTableCell>
                        <StyledTableCell className="electronic-code">{row.electronicCode}</StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.division}
                            onChange={(e) => handleRowChange(row._id, 'division', e.target.value)}
                          >
                            {['A', 'B', 'C', 'D', 'E'].map(div => (
                              <MenuItem key={div} value={div}>{div}</MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.industry}
                            onChange={(e) => handleRowChange(row._id, 'industry', e.target.value)}
                          >
                            <MenuItem value="E">E 전기차</MenuItem>
                            <MenuItem value="H">H 수소</MenuItem>
                            <MenuItem value="I">I IT</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.partGroup}
                            onChange={(e) => handleRowChange(row._id, 'partGroup', e.target.value)}
                          >
                            <MenuItem value="A00">A00 S/Can</MenuItem>
                            <MenuItem value="B00">B00 Busbar</MenuItem>
                            <MenuItem value="C00">C00 Connector</MenuItem>
                            <MenuItem value="D00">D00 DummyPlate</MenuItem>
                            <MenuItem value="E00">E00 EndPlate</MenuItem>
                            <MenuItem value="F00">F00 Foldable</MenuItem>
                            <MenuItem value="G00">G00 Slidable</MenuItem>
                            <MenuItem value="R00">R00 Rollable</MenuItem>
                            <MenuItem value="P00">P00 PorousPlate</MenuItem>
                            <MenuItem value="S00">S00 SidePlate</MenuItem>
                            <MenuItem value="T00">T00 Tab</MenuItem>
                            <MenuItem value="U00">U00 Cell</MenuItem>
                            <MenuItem value="V00">V00 BP</MenuItem>
                            <MenuItem value="X00">X00 기타</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            className="revision-select"
                            value={row.revision}
                            onChange={(e) => handleRowChange(row._id, 'revision', e.target.value)}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  overflow: 'auto'
                                }
                              }
                            }}
                          >
                            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                              <MenuItem key={letter} value={letter}>{letter}</MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell className="item-name">
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.itemName || ''}
                            onChange={(e) => handleRowChange(row._id, 'itemName', e.target.value)}
                          />
                        </StyledTableCell>
                        <StyledTableCell className="item-type">
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.itemType || ''}
                            disabled
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.status}
                            onChange={(e) => handleRowChange(row._id, 'status', e.target.value)}
                          >
                            <MenuItem value="양산">양산</MenuItem>
                            <MenuItem value="개발">개발</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.unit}
                            onChange={(e) => handleRowChange(row._id, 'unit', e.target.value)}
                          >
                            <MenuItem value="EA">EA</MenuItem>
                            <MenuItem value="Kg">Kg</MenuItem>
                            <MenuItem value="M">M</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.model || ''}
                            onChange={(e) => handleRowChange(row._id, 'model', e.target.value)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.accountCode || ''}
                            onChange={(e) => handleRowChange(row._id, 'accountCode', e.target.value)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.note || ''}
                            onChange={(e) => handleRowChange(row._id, 'note', e.target.value)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            fullWidth
                            size="small"
                            value={row.author || ''}
                            onChange={(e) => handleRowChange(row._id, 'author', e.target.value)}
                          />
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
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
            </TableWrapper>

            {error && (
              <Box sx={{ color: 'error.main', textAlign: 'center', mt: 2 }}>
                {error}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 