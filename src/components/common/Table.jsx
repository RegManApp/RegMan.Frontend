import { cn } from '../../utils/helpers';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../hooks/useDirection';

const Table = ({
  columns,
  data,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  emptyMessage,
  className,
}) => {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const resolvedEmptyMessage = emptyMessage ?? t('table.empty');

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  `px-4 py-3 ${isRtl ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider`,
                  column.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700',
                  column.className
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className={cn('flex items-center gap-1', isRtl && 'flex-row-reverse justify-end')}>
                  {column.header}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {resolvedEmptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                      column.cellClassName
                    )}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Pagination component
export const TablePagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}) => {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className={cn('flex items-center justify-between px-4 py-3', className)}>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}
      </div>
      <div className={cn('flex items-center gap-2', isRtl && 'flex-row-reverse')}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          icon={PrevIcon}
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('pagination.pageOf', { page, total: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          icon={NextIcon}
          iconPosition={isRtl ? 'left' : 'right'}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
};

export default Table;
