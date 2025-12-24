import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import i18n from "../i18n";
import { getApiErrorMessageKey } from "../utils/i18nError";

/**
 * Custom hook for data fetching with loading, error, and refetch capabilities
 * @param {Function} fetchFn - The async function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Additional options
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    showErrorToast = true,
    initialData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchFn(...args);
        const result = response?.data ?? response;
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const messageKey = getApiErrorMessageKey(err);
        const translated = messageKey ? i18n.t(messageKey) : null;
        const errorMessage =
          translated ||
          err.response?.data?.message ||
          err.message ||
          i18n.t("errors.generic");
        setError(errorMessage);
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, onSuccess, onError, showErrorToast]
  );

  const refetch = useCallback(
    async (...args) => {
      setIsRefetching(true);
      try {
        const result = await execute(...args);
        return result;
      } finally {
        setIsRefetching(false);
      }
    },
    [execute]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [...dependencies, immediate]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    isRefetching,
    execute,
    refetch,
    reset,
    setData,
  };
};

/**
 * Custom hook for paginated data fetching
 */
export const usePaginatedFetch = (fetchFn, options = {}) => {
  const { pageSize = 10, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWithPagination = useCallback(async () => {
    return fetchFn({ page, pageSize });
  }, [fetchFn, page, pageSize]);

  const { data, isLoading, error, refetch, ...rest } = useFetch(
    fetchWithPagination,
    [page, pageSize],
    {
      ...options,
      onSuccess: (result) => {
        if (result?.totalPages !== undefined) {
          setTotalPages(result.totalPages);
        }
        if (result?.totalItems !== undefined) {
          setTotalItems(result.totalItems);
        }
        options.onSuccess?.(result);
      },
    }
  );

  const goToPage = useCallback(
    (newPage) => {
      setPage(Math.max(1, Math.min(newPage, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    data: data?.items ?? data,
    isLoading,
    error,
    refetch,
    page,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    ...rest,
  };
};

export default useFetch;
