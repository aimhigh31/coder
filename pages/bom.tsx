import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Button,
  ButtonProps,
  Checkbox,
  Pagination,
  SelectChangeEvent,
} from '@mui/material';
import { 
  StyledTableCell, 
  StyledSelect, 
  StyledTextField, 
  FilterGroup, 
  ControlButton,
  ExcelButton,
  LoadingOverlay,
  TableWrapper,
  TableContainerStyled,
  PaginationBox,
  ErrorBox
} from '../styles/components';
import * as XLSX from 'xlsx';

interface BomItem {
  _id?: string;
  no: number;
  industry: string;
  model: string;
  itemType: string;
  level: number;
  electronicCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  process: string;
  note: string;
}

interface CodeItem {
  _id: string;
  electronicCode: string;
  itemName: string;
  industry: string;
  model: string;
  unit: string;
  itemType: string;
}

export default function BomPage() {
  const [rows, setRows] = useState<BomItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeItems, setCodeItems] = useState<CodeItem[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 11;  // 한 페이지당 11개 행
  const [filters, setFilters] = useState({
    itemType: '',
    level: '',
    electronicCode: '',
    itemName: '',
    process: '',
    industry: '',
    model: '',
  });

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  
  // 현재 페이지에 표시할 행들
  const displayedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // 페이지 변경 핸들러
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  type FilterKeys = keyof typeof filters;

  useEffect(() => {
    setLoading(true);
    fetchCodeItems();
    fetchBomItems();
    setLoading(false);
  }, []);

  const fetchCodeItems = async () => {
    try {
      const response = await fetch('/api/items');
      const result = await response.json();
      if (result.success) {
        console.log('Loaded code items:', result.data);
        setCodeItems(result.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch code items';
      setError(errorMessage);
      console.error(errorMessage);
    }
  };

  const fetchBomItems = async () => {
    try {
      const response = await fetch('/api/bom');
      const result = await response.json();
      if (result.success) {
        setRows(sortBomItems(result.data));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch BOM items';
      setError(errorMessage);
      console.error(errorMessage);
    }
  };

  const handleCodeSelect = (rowId: string, code: string) => {
    const selectedCode = codeItems.find(item => item.electronicCode === code);
    if (selectedCode) {
      console.log('Selected code data:', selectedCode);
      setRows(prev => prev.map(row => {
        if (row._id === rowId) {
          return {
            ...row,
            electronicCode: code,
            itemName: selectedCode.itemName,
            unit: selectedCode.unit,
            industry: selectedCode.industry,
            model: selectedCode.model,
            itemType: selectedCode.itemType,
          } as BomItem;
        }
        return row;
      }));
    }
  };

  const handleAddRow = async () => {
    try {
      setLoading(true);
      const currentMaxNo = rows.length > 0 
        ? Math.max(...rows.map(row => row.no))
        : 0;
      const nextNo = currentMaxNo + 1;
      
      const tempId = `temp-${Date.now()}-${nextNo}`;
      
      const newRow: BomItem = {
        _id: tempId,
        no: nextNo,
        industry: '',
        model: '',
        itemType: '제품',
        level: 1,
        electronicCode: '',
        itemName: '',
        quantity: 0,
        unit: '',
        process: '',
        note: '',
      };

      setRows(prev => sortBomItems([...prev, newRow]));
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const sortBomItems = (items: BomItem[]) => {
    return [...items].sort((a, b) => b.no - a.no);
  };

  const handleRemoveRows = async () => {
    if (selectedRows.length === 0) return;
    
    try {
      // 실제 DB에서 삭제하는 API 호출
      await Promise.all(
        selectedRows.map(id => 
          fetch(`/api/bom/${id}`, { method: 'DELETE' })
        )
      );
      
      setRows(prev => prev.filter(row => 
        !row._id || !selectedRows.includes(row._id)
      ));
      setSelectedRows([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove rows');
      console.error('Failed to remove rows:', error);
    }
  };

  const saveData = async () => {
    try {
      setLoading(true);
      const newRows = rows.filter(row => row._id?.startsWith('temp-'));
      const existingRows = rows.filter(row => row._id && !row._id.startsWith('temp-'));

      if (newRows.length > 0) {
        for (const row of newRows) {
          if (!row.electronicCode || !row.itemName) {
            throw new Error(`행 ${row.no}: 전산코드와 품목명은 필수 입력 항목입니다.`);
          }

          const newItem = {
            no: row.no,
            industry: row.industry || '',
            model: row.model || '',
            itemType: row.itemType || '제품',
            level: row.level || 1,
            electronicCode: row.electronicCode,
            itemName: row.itemName,
            quantity: row.quantity || 0,
            unit: row.unit || 'EA',
            process: row.process || '',
            note: row.note || ''
          };

          const response = await fetch('/api/bom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || `행 ${row.no} 저장 실패`);
          }
        }
      }

      if (existingRows.length > 0) {
        const updatePromises = existingRows.map(row => {
          if (!row.electronicCode || !row.itemName) {
            throw new Error(`행 ${row.no}: 전산코드와 품목명은 필수 입력 항목입니다.`);
          }

          return fetch(`/api/bom/${row._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
          });
        });

        const responses = await Promise.all(updatePromises);
        const failedUpdates = responses.filter(response => !response.ok);
        
        if (failedUpdates.length > 0) {
          throw new Error('일부 행 업데이트에 실패했습니다.');
        }
      }

      await fetchBomItems();
      setError(null);
      alert('저장되었습니다.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.';
      console.error('Failed to save items:', errorMessage);
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows as unknown[]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM');
    XLSX.writeFile(workbook, 'nexplus_bom_data.xlsx');
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const response = await fetch('/api/bom/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });
        
        if (!response.ok) throw new Error('Failed to import data');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        
        setRows(result.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to import excel data');
        console.error('Failed to import excel:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(rows.filter(row => row._id).map(row => row._id as string));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleRowChange = (id: string, field: keyof BomItem, value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row._id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleTextFieldChange = (field: FilterKeys) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleFilterChange = (field: FilterKeys) => (
    event: SelectChangeEvent<unknown>
  ) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      // URL 파라미터로 필터 조건 전달
      const queryParams = new URLSearchParams(
        Object.entries(filters)
          .filter(([_, value]) => value !== '')
          .map(([key, value]) => [key, value.toString()])
      ).toString();

      const response = await fetch(`/api/bom?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setRows(result.data.sort((a: BomItem, b: BomItem) => b.no - a.no));
        setError(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch filtered data');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* 필터 영역 */}
          <Grid item xs={12}>
            <Grid 
              container 
              spacing={2} 
              alignItems="flex-end"
              sx={{
                backgroundColor: '#fff',
                padding: '8px 16px',
                marginBottom: '16px',
                justifyContent: 'space-between',
              }}
            >
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>품목유형</InputLabel>
                  <FormControl fullWidth size="small">
                    <StyledSelect
                      sx={{
                        backgroundColor: '#fff',
                        height: '40px'
                      }}
                      value={filters.itemType}
                      onChange={handleFilterChange('itemType')}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="제품">제품</MenuItem>
                      <MenuItem value="상품">상품</MenuItem>
                      <MenuItem value="반제품">반제품</MenuItem>
                      <MenuItem value="원자재">원자재</MenuItem>
                      <MenuItem value="부자재">부자재</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>사업군</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.industry}
                    onChange={handleTextFieldChange('industry')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>모델</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.model}
                    onChange={handleTextFieldChange('model')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>LEVEL</InputLabel>
                  <FormControl fullWidth size="small">
                    <StyledSelect
                      sx={{ minWidth: '150px' }}
                      value={filters.level}
                      onChange={handleFilterChange('level')}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {[1,2,3,4,5,6,7,8,9,10].map(level => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>전산코드</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.electronicCode}
                    onChange={handleTextFieldChange('electronicCode')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>품목명</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.itemName}
                    onChange={handleTextFieldChange('itemName')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.5}>
                <FilterGroup>
                  <InputLabel>공정</InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.process}
                    onChange={handleTextFieldChange('process')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs="auto">
                <ControlButton 
                  variant="contained" 
                  onClick={handleSearch}
                  sx={{ 
                    height: '40px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#5a6268',
                    },
                    minWidth: '120px',
                    borderRadius: '4px',
                    marginLeft: '8px'
                  }}
                >
                  조회
                </ControlButton>
              </Grid>
            </Grid>
          </Grid>

          {/* 버튼 영역 */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <ControlButton variant="contained" onClick={handleAddRow}>행 추가</ControlButton>
            <ControlButton variant="contained" onClick={handleRemoveRows}>행 제거</ControlButton>
            <ControlButton variant="contained" onClick={saveData}>저장</ControlButton>
            <ExcelButton variant="contained" onClick={handleExcelDownload}>엑셀 다운로드</ExcelButton>
            <ExcelButton
              variant="contained"
              component="label"
              sx={{ position: 'relative' }}
            >
              엑셀 업로드
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
              />
            </ExcelButton>
          </Grid>

          {/* 테이블 */}
          <Grid item xs={12}>
            <TableWrapper>
              <TableContainerStyled>
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
                      <StyledTableCell>사업군</StyledTableCell>
                      <StyledTableCell>모델</StyledTableCell>
                      <StyledTableCell>품목유형</StyledTableCell>
                      <StyledTableCell>LEVEL</StyledTableCell>
                      <StyledTableCell className="electronic-code">전산코드</StyledTableCell>
                      <StyledTableCell className="item-name">품목명</StyledTableCell>
                      <StyledTableCell>소요량</StyledTableCell>
                      <StyledTableCell>단위</StyledTableCell>
                      <StyledTableCell>공정</StyledTableCell>
                      <StyledTableCell>비고</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRows.map((row) => (
                      <TableRow key={row._id}>
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            checked={!!row._id && selectedRows.includes(row._id)}
                            onChange={() => row._id && handleRowSelect(row._id)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>{row.no}</StyledTableCell>
                        <StyledTableCell>{row.industry}</StyledTableCell>
                        <StyledTableCell>{row.model}</StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.itemType}
                            disabled={true}
                          >
                            <MenuItem value="제품">제품</MenuItem>
                            <MenuItem value="상품">상품</MenuItem>
                            <MenuItem value="반제품">반제품</MenuItem>
                            <MenuItem value="원자재">원자재</MenuItem>
                            <MenuItem value="부자재">부자재</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.level}
                            onChange={(e) => row._id && handleRowChange(row._id, 'level', Number(e.target.value))}
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map(level => (
                              <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.electronicCode}
                            onChange={(e) => handleCodeSelect(row._id || 'temp', e.target.value as string)}
                          >
                            <MenuItem value="">선택</MenuItem>
                            {codeItems.map(item => (
                              <MenuItem key={item._id} value={item.electronicCode}>
                                {item.electronicCode}
                              </MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>{row.itemName}</StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            value={row.quantity}
                            onChange={(e) => row._id && handleRowChange(row._id, 'quantity', Number(e.target.value))}
                            type="number"
                          />
                        </StyledTableCell>
                        <StyledTableCell>{row.unit}</StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            value={row.process}
                            onChange={(e) => row._id && handleRowChange(row._id, 'process', e.target.value)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledTextField
                            value={row.note}
                            onChange={(e) => row._id && handleRowChange(row._id, 'note', e.target.value)}
                          />
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainerStyled>

              {/* 페이지네이션 추가 */}
              {totalPages > 1 && (
                <PaginationBox>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </PaginationBox>
              )}
            </TableWrapper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 