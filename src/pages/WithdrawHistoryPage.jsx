import { useMemo } from "react";
import { Button, Card, Input, Table, TablePagination } from "../components/common";
import { withdrawRequestsApi } from "../api/withdrawRequestsApi";
import { useFetch, useTable } from "../hooks";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const WithdrawHistoryPage = () => {
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useFetch(() => withdrawRequestsApi.getMyWithdrawRequests(), [], {
    initialData: [],
  });

  const rows = useMemo(() => requests || [], [requests]);

  const table = useTable(rows, {
    initialSortField: "submittedAtUtc",
    initialSortDirection: "desc",
    pageSize: 10,
  });

  return (
    <div className="container mx-auto py-8">
      <Card title="Withdraw History">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by enrollment, status, reason..."
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
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : null}

          <Table
            isLoading={isLoading}
            columns={[
              { key: "requestId", header: "Request ID", sortable: true },
              { key: "enrollmentId", header: "Enrollment ID", sortable: true },
              { key: "status", header: "Status", sortable: true },
              {
                key: "submittedAtUtc",
                header: "Submitted",
                sortable: true,
                render: (value) => formatDateTime(value),
              },
              {
                key: "reviewedAtUtc",
                header: "Reviewed",
                sortable: true,
                render: (value) => formatDateTime(value),
              },
              {
                key: "reason",
                header: "Reason",
                render: (value) => (
                  <span className="block max-w-[28rem] truncate" title={value || ""}>
                    {value || "-"}
                  </span>
                ),
              },
            ]}
            data={table.data}
            sortField={table.sortField}
            sortDirection={table.sortDirection}
            onSort={table.handleSort}
            emptyMessage="No withdraw requests yet."
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
