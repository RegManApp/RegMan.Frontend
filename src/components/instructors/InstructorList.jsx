import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, SearchInput, Card, ConfirmModal, EmptyState } from '../common';
import { getFullName } from '../../utils/helpers';
import { getInstructorDegreeLabel } from '../../utils/constants';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

const InstructorList = ({
  instructors = [],
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  searchQuery = '',
  onSearchChange,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, instructor: null });
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

  const sortedInstructors = useMemo(() => {
    const list = Array.isArray(instructors) ? [...instructors] : [];
    if (!sortField) return list;

    const getValue = (instructor) => {
      if (!instructor) return null;
      switch (sortField) {
        case 'fullName':
          return (
            instructor.fullName ||
            getFullName(instructor.firstName, instructor.lastName) ||
            ''
          ).toString();
        default:
          return instructor[sortField] ?? null;
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
  }, [instructors, sortField, sortDirection]);

  const handleDelete = () => {
    if (deleteModal.instructor) {
      onDelete?.(deleteModal.instructor.instructorId || deleteModal.instructor.id);
      setDeleteModal({ isOpen: false, instructor: null });
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: t('instructors.table.name'),
      sortable: true,
      render: (_, instructor) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {instructor.title ? `${instructor.title} ` : ''}{instructor.fullName || getFullName(instructor.firstName, instructor.lastName)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{instructor.email}</p>
        </div>
      ),
    },
    {
      key: 'degree',
      header: t('instructors.table.degree'),
      render: (value, instructor) => (
        <Badge variant="info" size="sm">
          {getInstructorDegreeLabel(instructor.degree) || instructor.degreeDisplay || t('common.notAvailable')}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: t('instructors.table.department'),
      render: (value) => value || t('common.notAvailable'),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (_, instructor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={EyeIcon}
            onClick={() => navigate(`/instructors/${instructor.instructorId || instructor.id}`)}
          >
            {t('instructors.actions.view')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => onEdit?.(instructor)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={() => setDeleteModal({ isOpen: true, instructor })}
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  if (!isLoading && instructors.length === 0 && !searchQuery) {
    return (
      <Card>
        <EmptyState
          title={t('instructors.empty.title')}
          description={t('instructors.empty.description')}
          action={
            <Button icon={PlusIcon} onClick={onCreate}>{t('instructors.actions.add')}</Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange?.('')}
            placeholder={t('instructors.searchPlaceholder')}
            className="w-full sm:w-80"
          />
          <Button icon={PlusIcon} onClick={onCreate}>{t('instructors.actions.add')}</Button>
        </div>

        <Table
          columns={columns}
          data={sortedInstructors}
          isLoading={isLoading}
          emptyMessage={t('instructors.empty.table')}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, instructor: null })}
        onConfirm={handleDelete}
        title={t('instructors.confirmDeleteTitle')}
        message={t('instructors.confirmDeleteMessage', {
          name: deleteModal.instructor?.fullName || t('instructors.confirmDeleteNameFallback'),
        })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </>
  );
};

export default InstructorList;
