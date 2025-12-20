import { useState } from 'react';
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
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, instructor: null });

  const handleDelete = () => {
    if (deleteModal.instructor) {
      onDelete?.(deleteModal.instructor.instructorId || deleteModal.instructor.id);
      setDeleteModal({ isOpen: false, instructor: null });
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Name',
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
      header: 'Degree',
      render: (value, instructor) => (
        <Badge variant="info" size="sm">
          {getInstructorDegreeLabel(instructor.degree) || instructor.degreeDisplay || '-'}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (value) => value || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, instructor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={EyeIcon}
            onClick={() => navigate(`/instructors/${instructor.instructorId || instructor.id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => onEdit?.(instructor)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={() => setDeleteModal({ isOpen: true, instructor })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!isLoading && instructors.length === 0 && !searchQuery) {
    return (
      <Card>
        <EmptyState
          title="No instructors yet"
          description="Get started by adding your first instructor."
          action={
            <Button icon={PlusIcon} onClick={onCreate}>
              Add Instructor
            </Button>
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
            placeholder="Search instructors..."
            className="w-full sm:w-80"
          />
          <Button icon={PlusIcon} onClick={onCreate}>
            Add Instructor
          </Button>
        </div>

        <Table
          columns={columns}
          data={instructors}
          isLoading={isLoading}
          emptyMessage="No instructors found."
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
        title="Delete Instructor"
        message={`Are you sure you want to delete ${deleteModal.instructor?.fullName || 'this instructor'}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default InstructorList;
