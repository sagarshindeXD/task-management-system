import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  useTheme,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (ids: (string | number)[]) => void;
  onRefresh?: () => void;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showCheckboxes?: boolean;
  showActions?: boolean;
  showHeader?: boolean;
  emptyMessage?: string;
  height?: string | number;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  dense?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onRefresh,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortField,
  sortDirection = 'asc',
  searchTerm: externalSearchTerm,
  onSearch,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showCheckboxes = false,
  showActions = true,
  showHeader = true,
  emptyMessage = 'No data available',
  height = 'auto',
  maxHeight = '100%',
  stickyHeader = false,
  dense = false,
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Handle search
  React.useEffect(() => {
    if (onSearch && debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  // Handle external search term changes
  React.useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setLocalSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent, id: string | number) => {
    if (showCheckboxes) {
      event.stopPropagation();
      const selectedIndex = selected.indexOf(id);
      let newSelected: (string | number)[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleEdit = (event: React.MouseEvent, row: any) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(row);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(selected);
      setSelected([]);
    }
  };

  const handleRefresh = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSort = (columnId: string) => {
    if (onSort) {
      const isAsc = sortField === columnId && sortDirection === 'asc';
      onSort(columnId, isAsc ? 'desc' : 'asc');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  const isSelected = (id: string | number) => selected.indexOf(id) !== -1;

  const renderCell = (row: any, column: Column) => {
    const value = row[column.id];
    
    if (column.format) {
      return column.format(value);
    }
    
    return value !== undefined && value !== null ? String(value) : '-';
  };

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        height: height,
        display: 'flex',
        flexDirection: 'column',
      }}
      elevation={0}
      variant="outlined"
    >
      {showHeader && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showSearch && (
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={localSearchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
                variant="outlined"
              />
            )}
          </Box>
          <Box>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && selected.length > 0 && (
              <Tooltip title="Delete selected">
                <IconButton onClick={handleDelete} size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ position: 'relative', flex: 1, overflow: 'auto' }}>
        <TableContainer
          sx={{
            maxHeight: maxHeight,
            height: '100%',
            position: 'relative',
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
          <Table
            stickyHeader={stickyHeader}
            size={dense ? 'small' : 'medium'}
            aria-label="data table"
          >
            <TableHead>
              <TableRow>
                {showCheckboxes && (
                  <TableCell padding="checkbox" sx={{ width: 48 }}>
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < data.length
                      }
                      checked={data.length > 0 && selected.length === data.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all' }}
                      size="small"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth, fontWeight: 600 }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortField === column.id}
                        direction={sortField === column.id ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                {showActions && (onEdit || onDelete) && (
                  <TableCell align="right" sx={{ width: 100 }}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (showCheckboxes ? 1 : 0) + (showActions ? 1 : 0)
                    }
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${row.id}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: onRowClick
                            ? theme.palette.action.hover
                            : 'inherit',
                        },
                      }}
                    >
                      {showCheckboxes && (
                        <TableCell
                          padding="checkbox"
                          onClick={(event) => handleClick(event, row.id)}
                        >
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': labelId }}
                            size="small"
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={`${row.id}-${column.id}`}
                          align={column.align || 'left'}
                        >
                          {renderCell(row, column)}
                        </TableCell>
                      ))}
                      {showActions && (onEdit || onDelete) && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {onEdit && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleEdit(e, row)}
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete([row.id]);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-toolbar': {
              minHeight: '52px',
            },
          }}
        />
      )}
    </Paper>
  );
};

export default DataTable;