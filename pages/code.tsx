import React, { useState, useEffect } from 'react';
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
import { 
  StyledTableCell, 
  StyledSelect, 
  StyledTextField, 
  FilterGroup, 
  ControlButton,
  ExcelButton,
  LoadingOverlay,
  TableWrapper,
  SearchButton,
  HiddenInput,
  TableContainerStyled,
  PaginationBox,
  ErrorBox
} from '../styles/components';
import { SelectChangeEvent } from '@mui/material/Select';

interface CodeItem {
  _id: string;
  no: number;
  datetime: string;
  division: string;
  industry: string;
  partGroup: string;
  revision: string;
  electronicCode: string;
  itemName: string;
  itemType: string;
  status: string;
  unit: string;
  model?: string;
  accountCode?: string;
  note?: string;
  author?: string;
}

interface FilterState {
  industry: string;
  division: string;
  partGroup: string;
  code: string;
  name: string;
  model: string;
}

export default function CodePage() {
  const [rows, setRows] = useState<CodeItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    industry: '',
    division: '',
    partGroup: '',
    code: '',
    name: '',
    model: '',
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [originalRows, setOriginalRows] = useState<CodeItem[]>([]);

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
      
      const sortedData = sortCodeItems(result.data);
      setOriginalRows(sortedData);
      setRows(sortedData);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof typeof filters) => (
    event: SelectChangeEvent<unknown>
  ) => {
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

  const handleAddRow = async () => {
    try {
      setLoading(true);
      
      const currentMaxNo = rows.length > 0 
        ? Math.max(...rows.map(row => row.no))
        : 0;
      const nextNo = currentMaxNo + 1;
      
      const defaultDivision = 'A';
      const defaultIndustry = 'E';
      const defaultPartGroup = 'A00';
      const defaultRevision = 'A';
      
      const newRow = {
        _id: `temp-${Date.now()}`,
        no: nextNo,
        datetime: new Date().toISOString(),
        division: defaultDivision,
        industry: defaultIndustry,
        partGroup: defaultPartGroup,
        itemName: '신규품목',
        itemType: '제품',
        status: '양산',
        unit: 'EA',
        revision: defaultRevision,
        electronicCode: `${defaultDivision}-${defaultIndustry}-${defaultPartGroup}-${String(nextNo).padStart(5, '0')}${defaultRevision}`,
        model: '',
        accountCode: '',
        note: '',
        author: ''
      };

      if (!newRow.division || !newRow.industry || !newRow.partGroup || !newRow.itemName || !newRow.electronicCode) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      setRows(prev => sortCodeItems([...prev, newRow]));
      setError(null);

    } catch (error) {
      setError(error instanceof Error ? error.message : '행 추가 실패');
      console.error('Failed to add row:', error);
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
      setLoading(true);
      const newRows = rows.filter(row => row._id?.startsWith('temp-'));
      const existingRows = rows.filter(row => row._id && !row._id.startsWith('temp-'));

      // 새 행들 저장
      if (newRows.length > 0) {
        // 각 새 행을 개별적으로 저장
        for (const row of newRows) {
          if (!row.division || !row.industry || !row.partGroup || !row.itemName) {
            throw new Error('모든 필수 필드(대분류, 산업군, 부품군, 품목명)를 입력해주세요.');
          }

          const newItem = {
            no: row.no,
            datetime: row.datetime,
            division: row.division,
            industry: row.industry,
            partGroup: row.partGroup,
            revision: row.revision || 'A',
            electronicCode: generateElectronicCode(row),
            itemName: row.itemName,
            itemType: row.itemType || '제품',
            status: row.status || '양산',
            unit: row.unit || 'EA',
            model: row.model || '',
            accountCode: row.accountCode || '',
            note: row.note || '',
            author: row.author || ''
          };

          const response = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),  // 단일 객체로 전송
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || `행 ${row.no} 저장 실패`);
          }
        }
      }

      // 기존 행들 업데이트
      if (existingRows.length > 0) {
        const updatePromises = existingRows.map(row => {
          if (!row.division || !row.industry || !row.partGroup || !row.itemName) {
            throw new Error('모든 필수 필드(대분류, 산업군, 부품군, 품목명)를 입력해주세요.');
          }

          return fetch(`/api/items/${row._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...row,
              electronicCode: row.electronicCode || generateElectronicCode(row),
              status: row.status || '양산',
              unit: row.unit || 'EA',
              itemType: row.itemType || '제품'
            }),
          });
        });

        const responses = await Promise.all(updatePromises);
        const failedUpdates = responses.filter(response => !response.ok);
        
        if (failedUpdates.length > 0) {
          throw new Error('일부 행 업데이트에 실패했습니다.');
        }
      }

      await fetchItems();  // 성공 후 데이터 새로고침
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

  const handleSelectAll = (
    event: React.ChangeEvent<HTMLInputElement & { checked: boolean }>
  ) => {
    if (event.target.checked) {
      setSelectedRows(rows.map((row) => row._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowChange = (id: string, field: keyof CodeItem, value: string | number) => {
    setRows(prev => {
      const updatedRows = prev.map(row => {
        if (row._id === id) {
          const updatedRow = { ...row, [field]: value } as CodeItem;
          if (['division', 'industry', 'partGroup'].includes(field)) {
            updatedRow.electronicCode = generateElectronicCode(updatedRow);
          }
          return updatedRow;
        }
        return row;
      });
      return sortCodeItems(updatedRows);
    });
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
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

  const handleTextFieldChange = (field: keyof FilterState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  // 전산코드 자동 생성 함수 추가
  const generateElectronicCode = (row: CodeItem) => {
    if (!row.division || !row.industry || !row.partGroup) return '';
    const numberPart = String(row.no).padStart(5, '0');
    return `${row.division}-${row.industry}-${row.partGroup}-${numberPart}${row.revision || 'A'}`;
  };

  // 정렬 함수 추가
  const sortCodeItems = (items: CodeItem[]) => {
    return [...items].sort((a, b) => b.no - a.no);
  };

  return (
    <Container maxWidth={false} sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        {error && (
          <Box sx={{ color: 'error.main', textAlign: 'center', my: 2 }}>
            {error}
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel shrink>
                    산업군
                  </InputLabel>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <StyledSelect
                      value={filters.industry}
                      onChange={handleFilterChange('industry')}
                      displayEmpty
                    >
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
                  <InputLabel shrink>
                    대분류
                  </InputLabel>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <StyledSelect
                      value={filters.division}
                      onChange={handleFilterChange('division')}
                      displayEmpty
                    >
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
                  <InputLabel shrink>
                    부품군
                  </InputLabel>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <StyledSelect
                      value={filters.partGroup}
                      onChange={handleFilterChange('partGroup')}
                      displayEmpty
                    >
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
                  <InputLabel shrink>
                    전산코드
                  </InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.code}
                    onChange={handleTextFieldChange('code')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel shrink>
                    품목명
                  </InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.name}
                    onChange={handleTextFieldChange('name')}
                  />
                </FilterGroup>
              </Grid>
              <Grid item xs={1.8}>
                <FilterGroup>
                  <InputLabel shrink>
                    모델
                  </InputLabel>
                  <StyledTextField
                    size="small"
                    fullWidth
                    value={filters.model}
                    onChange={handleTextFieldChange('model')}
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
            <ControlButton variant="contained" onClick={handleAddRow}>행 추가</ControlButton>
            <ControlButton variant="contained" onClick={removeSelectedRows}>행 제거</ControlButton>
            <ControlButton variant="contained" onClick={saveData}>저장</ControlButton>
            <ExcelButton variant="contained" onClick={exportToExcel}>엑셀 다운로드</ExcelButton>
            <HiddenInput
              type="file"
              accept=".xlsx,.xls"
              id="excel-upload"
              aria-label="엑셀 파일 업로드"
              onChange={importExcel}
            />
            <ExcelButton
              variant="contained"
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              엑셀 업로드
            </ExcelButton>
          </Grid>

          <Grid item xs={12}>
            <TableWrapper>
              {loading && (
                <LoadingOverlay>
                  <CircularProgress />
                </LoadingOverlay>
              )}
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
                            onChange={(e) => handleRowChange(row._id, 'division', e.target.value as string)}
                          >
                            {['A', 'B', 'C', 'D', 'E'].map(div => (
                              <MenuItem key={div} value={div}>{div}</MenuItem>
                            ))}
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.industry}
                            onChange={(e) => handleRowChange(row._id, 'industry', e.target.value as string)}
                          >
                            <MenuItem value="E">E 전기차</MenuItem>
                            <MenuItem value="H">H 수소</MenuItem>
                            <MenuItem value="I">I IT</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.partGroup}
                            onChange={(e) => handleRowChange(row._id, 'partGroup', e.target.value as string)}
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
                            onChange={(e) => handleRowChange(row._id, 'revision', e.target.value as string)}
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
                            onChange={(e) => handleRowChange(row._id, 'status', e.target.value as string)}
                          >
                            <MenuItem value="양산">양산</MenuItem>
                            <MenuItem value="개발">개발</MenuItem>
                          </StyledSelect>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSelect
                            value={row.unit}
                            onChange={(e) => handleRowChange(row._id, 'unit', e.target.value as string)}
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
              </TableContainerStyled>

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

            {error && (
              <ErrorBox>
                {error}
              </ErrorBox>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 