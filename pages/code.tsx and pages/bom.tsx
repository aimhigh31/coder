import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { 
  StyledTableCell,
  ExcelButton,
  TableWrapper,
  TableContainerStyled,
} from '@/styles/components';
import * as XLSX from 'xlsx';

const ADMIN_PASSWORD = 'admin1234';

export default function CodePage() {
  const [uploadPasswordDialogOpen, setUploadPasswordDialogOpen] = useState(false);
  const [uploadPasswordInput, setUploadPasswordInput] = useState('');
  const [selectAllPasswordDialogOpen, setSelectAllPasswordDialogOpen] = useState(false);
  const [selectAllPasswordInput, setSelectAllPasswordInput] = useState('');
  const [tempImportedRows, setTempImportedRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 10;

  const displayedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const handleExcelUploadClick = () => {
    setUploadPasswordDialogOpen(true);
  };

  const handleUploadPasswordConfirm = () => {
    if (uploadPasswordInput === ADMIN_PASSWORD) {
      document.getElementById('excel-upload')?.click();
      setUploadPasswordDialogOpen(false);
      setUploadPasswordInput('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setUploadPasswordInput('');
    }
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setTempImportedRows(jsonData);
        alert('엑셀 데이터가 임시로 등재되었습니다. 저장 버튼을 클릭하여 최종 저장하세요.');
      };
      reader.readAsArrayBuffer(file);
    }
    event.target.value = '';
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.checked) {
      setSelectAllPasswordDialogOpen(true);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectAllPasswordConfirm = () => {
    if (selectAllPasswordInput === ADMIN_PASSWORD) {
      const validIds = displayedRows
        .filter(row => row._id)
        .map(row => row._id);
      setSelectedRows(validIds);
      setSelectAllPasswordDialogOpen(false);
      setSelectAllPasswordInput('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setSelectAllPasswordInput('');
    }
  };

  const saveData = async () => {
    try {
      setLoading(true);
      if (tempImportedRows.length > 0) {
        await Promise.all(tempImportedRows.map(row => 
          fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
          })
        ));
        setTempImportedRows([]);
      }

      const newRows = rows.filter(row => row._id?.startsWith('temp-'));
      const existingRows = rows.filter(row => !row._id?.startsWith('temp-'));
      
      await fetchItems();
      alert('저장이 완료되었습니다.');
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      const data = await response.json();
      if (data.success) {
        setRows(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <ExcelButton
                variant="contained"
                onClick={handleExcelUploadClick}
              >
                엑셀 업로드
              </ExcelButton>
            </Box>

            <TableWrapper>
              <TableContainerStyled>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.length > 0 && selectedRows.length === displayedRows.length}
                          onChange={handleSelectAll}
                          indeterminate={selectedRows.length > 0 && selectedRows.length < displayedRows.length}
                        />
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainerStyled>
            </TableWrapper>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={uploadPasswordDialogOpen} onClose={() => setUploadPasswordDialogOpen(false)}>
        <DialogTitle>관리자 확인</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={uploadPasswordInput}
            onChange={(e) => setUploadPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUploadPasswordConfirm()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUploadPasswordDialogOpen(false);
            setUploadPasswordInput('');
          }}>취소</Button>
          <Button onClick={handleUploadPasswordConfirm}>확인</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={selectAllPasswordDialogOpen} onClose={() => setSelectAllPasswordDialogOpen(false)}>
        <DialogTitle>관리자 확인</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={selectAllPasswordInput}
            onChange={(e) => setSelectAllPasswordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSelectAllPasswordConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSelectAllPasswordDialogOpen(false);
            setSelectAllPasswordInput('');
          }}>
            취소
          </Button>
          <Button onClick={handleSelectAllPasswordConfirm}>확인</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 