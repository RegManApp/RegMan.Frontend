import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
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
  const { t } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    const list = Array.isArray(students) ? [...students] : [];
    if (!sortField) return list;

    const getValue = (student) => {
      if (!student) return null;
      switch (sortField) {
        case 'studentId':
          return (
            student.studentProfile?.studentId ||
            student.id?.substring(0, 8) ||
            ''
          ).toString();
        case 'name': {
          const fullName =
            student.fullName ||
            student.user?.fullName ||
            getFullName(student.user?.firstName, student.user?.lastName) ||
            '';
          return fullName.toString();
        }
        case 'completedCredits':
          return Number(student.studentProfile?.completedCredits ?? 0);
        case 'gpa':
          return Number(student.studentProfile?.gpa ?? 0);
        default:
          return student[sortField] ?? null;
      }
    };

    list.sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        comparison = aVal < bVal ? -1 : 1;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [students, sortField, sortDirection]);

  const columns = [
    {
      key: 'studentId',
      header: 'Student ID',
      sortable: true,
      render: (_, student) => (
        <span className="font-mono text-sm">
          {student.studentProfile?.studentId || student.id?.substring(0, 8) || t('common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_, student) => {
        const fullName = student.fullName || student.user?.fullName || getFullName(student.user?.firstName, student.user?.lastName);
        const initials = fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || t('common.initialsFallback');
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
        data={sortedStudents}
        isLoading={isLoading}
        emptyMessage="No students match your search criteria."
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
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
        title={t('students.confirmDeleteTitle')}
        message={t('students.confirmDeleteMessage', {
          name: deleteModal.student?.fullName || t('students.confirmDeleteNameFallback'),
        })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};

export default StudentList;
