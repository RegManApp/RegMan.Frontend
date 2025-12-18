import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for table data with sorting, filtering, and pagination
 */
export const useTable = (data = [], options = {}) => {
  const {
    initialSortField = null,
    initialSortDirection = 'asc',
    initialFilters = {},
    pageSize = 10,
  } = options;

  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sorting
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Handle filtering
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery('');
    setPage(1);
  }, [initialFilters]);

  // Process data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter((item) => {
          if (typeof value === 'function') {
            return value(item[key]);
          }
          return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (aValue == null) comparison = 1;
        else if (bValue == null) comparison = -1;
        else if (typeof aValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : 1;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);

  return {
    data: paginatedData,
    allData: processedData,
    sortField,
    sortDirection,
    filters,
    page,
    totalPages,
    totalItems: processedData.length,
    searchQuery,
    setSearchQuery,
    handleSort,
    setFilter,
    clearFilters,
    setPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
};

export default useTable;
