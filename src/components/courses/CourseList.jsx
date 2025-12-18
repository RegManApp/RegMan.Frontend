import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  Table,
  TablePagination,
  Button,
  Badge,
  SearchInput,
  EmptyState,
  ConfirmModal,
} from '../common';

const CourseList = ({
  courses,
  isLoading,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isAdmin,
}) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });

  const columns = [
    {
      key: 'courseCode',
      header: 'Code',
      sortable: true,
    },
    {
      key: 'courseName',
      header: 'Course Name',
      sortable: true,
      render: (value, course) => (
        <div>
          <Link
            to={`/courses/${course.id}`}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {value}
          </Link>
          {course.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {course.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'creditHours',
      header: 'Credits',
      sortable: true,
    },
    {
      key: 'categoryName',
      header: 'Category',
      sortable: true,
      render: (value) => value ? (
        <Badge variant="secondary" size="sm">
          <TagIcon className="w-3 h-3 mr-1" />
          {value}
        </Badge>
      ) : '-',
    },
    {
      key: 'enrollmentCount',
      header: 'Enrolled',
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, course) => (
        <div className="flex items-center gap-2">
          <Link to={`/courses/${course.id}`}>
            <Button variant="ghost" size="sm" icon={EyeIcon}>
              View
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={PencilIcon}
                onClick={() => onEdit?.(course)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={TrashIcon}
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteModal({ isOpen: true, course })}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleConfirmDelete = async () => {
    if (deleteModal.course) {
      await onDelete?.(deleteModal.course.id);
      setDeleteModal({ isOpen: false, course: null });
    }
  };

  if (!isLoading && courses.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title="No courses found"
        description={isAdmin ? "Get started by creating your first course." : "No courses are available at the moment."}
        action={
          isAdmin && <Button onClick={() => onEdit?.({})}>Create Course</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search courses..."
          className="w-full sm:w-80"
        />
        {isAdmin && (
          <Button onClick={() => onEdit?.({})}>Create Course</Button>
        )}
      </div>

      <Table
        columns={columns}
        data={courses}
        isLoading={isLoading}
        emptyMessage="No courses match your search criteria."
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
        onClose={() => setDeleteModal({ isOpen: false, course: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteModal.course?.courseName}"? This will also remove all enrollments. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CourseList;
