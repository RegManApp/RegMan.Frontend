import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import {
  PageLoading,
  Breadcrumb,
  Card,
  Button,
  Table,
  TablePagination,
  SearchInput,
  Badge,
  ConfirmModal,
  Modal,
  Input,
  Select,
} from '../components/common';
import { getFullName, getRoleColor, formatDate } from '../utils/helpers';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formUser, setFormUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // Pagination & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const loadUsers = useCallback(async () => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.getAll({
        page,
        pageSize,
        search: searchQuery,
      });
      const data = response.data;
      setUsers(data.items || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || data.length);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, isAdmin, navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user) => {
    setFormUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      await userApi.delete(deleteModal.user.id);
      toast.success('User deleted successfully');
      setDeleteModal({ isOpen: false, user: null });
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formUser) return;

    setIsFormLoading(true);
    try {
      await userApi.update(formUser.id, formUser);
      toast.success('User updated successfully');
      setIsFormOpen(false);
      setFormUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userApi.assignRole(userId, role);
      toast.success('Role assigned successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_, user) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {getFullName(user.firstName, user.lastName)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <Badge className={getRoleColor(value)}>{value || 'User'}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <select
            value=""
            onChange={(e) => handleRoleChange(user.id, e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value="" disabled>
              Assign Role
            </option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => handleEdit(user)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700"
            onClick={() => setDeleteModal({ isOpen: true, user })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading && !users.length) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ name: 'Users', href: '/users', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search users..."
            className="w-full sm:w-80"
          />
        </div>

        <Table
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found."
        />

        {totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormUser(null);
        }}
        title="Edit User"
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="First Name"
            value={formUser?.firstName || ''}
            onChange={(e) =>
              setFormUser({ ...formUser, firstName: e.target.value })
            }
          />
          <Input
            label="Last Name"
            value={formUser?.lastName || ''}
            onChange={(e) =>
              setFormUser({ ...formUser, lastName: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={formUser?.email || ''}
            onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
          />
          <Select
            label="Role"
            value={formUser?.role || ''}
            onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Student', label: 'Student' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setFormUser(null);
              }}
              disabled={isFormLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isFormLoading}>
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${getFullName(
          deleteModal.user?.firstName,
          deleteModal.user?.lastName
        )}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;
