import { useMemo } from "react";
import { Button, Card, Input, Table, TablePagination } from "../components/common";
import { withdrawRequestsApi } from "../api/withdrawRequestsApi";
import { useFetch, useTable } from "../hooks";
import { useTranslation } from 'react-i18next';

const WithdrawHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useFetch(() => withdrawRequestsApi.getMyWithdrawRequests(), [], {
    initialData: [],
  });

  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';

  const rows = useMemo(() => requests || [], [requests]);

  const table = useTable(rows, {
    initialSortField: "submittedAtUtc",
    initialSortDirection: "desc",
    pageSize: 10,
  });

  return (
    <div className="container mx-auto py-8">
      <Card title={t('nav.withdrawHistory')}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Input
                label={t('common.search')}
                placeholder={t('withdrawHistory.placeholders.search')}
                value={table.searchQuery}
                onChange={(e) => table.setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {t('common.refresh')}
            </Button>
          </div>

          {error ? (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : null}

          <Table
            isLoading={isLoading}
            columns={[
              { key: "requestId", header: t('withdrawHistory.columns.requestId'), sortable: true },
              { key: "enrollmentId", header: t('withdrawHistory.columns.enrollmentId'), sortable: true },
              { key: "status", header: t('withdrawHistory.columns.status'), sortable: true },
              {
                key: "submittedAtUtc",
                header: t('withdrawHistory.columns.submitted'),
                sortable: true,
                render: (value) => (value ? new Date(value).toLocaleString(locale) : t('common.notAvailable')),
              },
              {
                key: "reviewedAtUtc",
                header: t('withdrawHistory.columns.reviewed'),
                sortable: true,
                render: (value) => (value ? new Date(value).toLocaleString(locale) : t('common.notAvailable')),
              },
              {
                key: "reason",
                header: t('withdrawHistory.columns.reason'),
                render: (value) => (
                  <span className="block max-w-[28rem] truncate" title={value || ""}>
                    {value || t('common.notAvailable')}
                  </span>
                ),
              },
            ]}
            data={table.data}
            sortField={table.sortField}
            sortDirection={table.sortDirection}
            onSort={table.handleSort}
            emptyMessage={t('withdrawHistory.empty')}
          />

          {table.totalItems > 0 && (
            <TablePagination
              page={table.page}
              totalPages={table.totalPages}
              totalItems={table.totalItems}
              pageSize={10}
              onPageChange={table.setPage}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default WithdrawHistoryPage;
