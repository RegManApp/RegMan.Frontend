import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  Table,
  TablePagination,
  Button,
  SearchInput,
  EmptyState,
  ConfirmModal,
} from '../common';
import { getFullName } from '../../utils/helpers';

const StudentList = ({
  students,
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
}) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });

  const columns = [
    {
      key: 'studentId',
      header: 'Student ID',
      sortable: true,
      render: (_, student) => (
        <span className="font-mono text-sm">
          {student.studentProfile?.studentId || student.id?.substring(0, 8) || 'N/A'}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_, student) => {
        const fullName = student.fullName || student.user?.fullName || getFullName(student.user?.firstName, student.user?.lastName);
        const initials = fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                {initials}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.email || student.user?.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'completedCredits',
      header: 'Credits',
      sortable: true,
      render: (_, student) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            {student.studentProfile?.completedCredits || 0}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm"> completed</span>
        </div>
      ),
    },
    {
      key: 'gpa',
      header: 'GPA',
      sortable: true,
      render: (_, student) => {
        const gpa = student.studentProfile?.gpa || 0;
        const gpaColor = gpa >= 3.5 ? 'text-green-600' : gpa >= 2.0 ? 'text-blue-600' : 'text-red-600';
        return (
          <span className={`font-semibold ${gpaColor}`}>
            {gpa.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, student) => (
        <div className="flex items-center gap-2">
          <Link to={`/students/${student.id}`}>
            <Button variant="ghost" size="sm" icon={EyeIcon}>
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => onEdit?.(student)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700"
            onClick={() => setDeleteModal({ isOpen: true, student })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleConfirmDelete = async () => {
    if (deleteModal.student) {
      await onDelete?.(deleteModal.student.id);
      setDeleteModal({ isOpen: false, student: null });
    }
  };

  if (!isLoading && students.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title="No students found"
        description="Get started by adding your first student."
        action={
          <Button onClick={() => onEdit?.({})}>Add Student</Button>
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
          placeholder="Search students..."
          className="w-full sm:w-80"
        />
        <Button onClick={() => onEdit?.({})}>Add Student</Button>
      </div>

      <Table
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyMessage="No students match your search criteria."
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
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteModal.student?.fullName || 'this student'}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default StudentList;
