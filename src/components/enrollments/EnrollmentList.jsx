import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Table,
  TablePagination,
  Button,
  Badge,
  SearchInput,
  EmptyState,
  ConfirmModal,
  Select,
} from '../common';
import { getFullName, getStatusColor, formatDate } from '../../utils/helpers';
import { ENROLLMENT_STATUSES, getEnrollmentStatusLabel, GRADES } from '../../utils/constants';

const EnrollmentList = ({
  enrollments,
  isLoading,
  onEdit,
  onDelete,
  onUpdateGrade,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isAdmin,
}) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, enrollment: null });

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {getFullName(
              enrollment.student?.user?.firstName,
              enrollment.student?.user?.lastName
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.student?.studentNumber}
          </p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, enrollment) => (
        <div>
          <Link
            to={`/courses/${enrollment.courseId}`}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {enrollment.course?.courseName}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.course?.courseCode}
          </p>
        </div>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (value) => value || '-',
    },
    {
      key: 'enrollmentDate',
      header: 'Enrolled On',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value, enrollment) => {
        if (isAdmin && enrollment.status === 0) { // Enrolled status
          return (
            <select
              value={value || ''}
              onChange={(e) => onUpdateGrade?.(enrollment.id, e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value="">-</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          );
        }
        return value || '-';
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={getStatusColor(value)}>{getEnrollmentStatusLabel(value)}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, enrollment) => (
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={PencilIcon}
                onClick={() => onEdit?.(enrollment)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={TrashIcon}
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteModal({ isOpen: true, enrollment })}
              >
                Drop
              </Button>
            </>
          )}
          {!isAdmin && enrollment.status === 0 && ( // Enrolled status
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: true, enrollment })}
            >
              Drop
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleConfirmDelete = async () => {
    if (deleteModal.enrollment) {
      await onDelete?.(deleteModal.enrollment.id);
      setDeleteModal({ isOpen: false, enrollment: null });
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    ...ENROLLMENT_STATUSES.map((status) => ({
      value: status.value,
      label: status.label,
    })),
  ];

  if (!isLoading && enrollments.length === 0 && !searchQuery && !statusFilter) {
    return (
      <EmptyState
        title="No enrollments found"
        description={
          isAdmin
            ? "Get started by enrolling students in courses."
            : "You are not enrolled in any courses yet."
        }
        action={
          isAdmin ? (
            <Button onClick={() => onEdit?.({})}>Create Enrollment</Button>
          ) : (
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search enrollments..."
            className="w-full sm:w-64"
          />
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={statusOptions}
            className="w-full sm:w-40"
          />
        </div>
        {isAdmin && (
          <Button onClick={() => onEdit?.({})}>Create Enrollment</Button>
        )}
      </div>

      <Table
        columns={columns}
        data={enrollments}
        isLoading={isLoading}
        emptyMessage="No enrollments match your search criteria."
      />

      {totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, enrollment: null })}
        onConfirm={handleConfirmDelete}
        title="Drop Enrollment"
        message={`Are you sure you want to drop this enrollment? ${
          isAdmin
            ? `This will remove ${getFullName(
                deleteModal.enrollment?.student?.user?.firstName,
                deleteModal.enrollment?.student?.user?.lastName
              )} from ${deleteModal.enrollment?.course?.courseName}.`
            : 'This action cannot be undone.'
        }`}
        confirmText="Drop"
        variant="danger"
      />
    </div>
  );
};

export default EnrollmentList;
