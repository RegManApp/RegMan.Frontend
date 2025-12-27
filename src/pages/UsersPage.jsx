import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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
      console.error(error);
      toast.error(t('users.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, isAdmin, navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    const list = Array.isArray(users) ? [...users] : [];
    if (!sortField) return list;

    const getValue = (user) => {
      if (!user) return null;
      switch (sortField) {
        case 'name':
          return (user.fullName || getFullName(user.firstName, user.lastName) || '').toString();
        case 'createdAt':
          return user.createdAt ? new Date(user.createdAt).getTime() : null;
        default:
          return user[sortField] ?? null;
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
  }, [users, sortField, sortDirection]);

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      await userApi.delete(deleteModal.user.id);
      toast.success(t('users.toasts.deleted'));
      setDeleteModal({ isOpen: false, user: null });
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formUser) return;

    setIsFormLoading(true);
    try {
      // Update user info
      await userApi.update(formUser.id, {
        fullName: formUser.fullName,
        address: formUser.address,
      });
      
      // Update role if changed
      if (formUser.role && formUser.originalRole !== formUser.role) {
        await userApi.updateRole(formUser.id, formUser.role);
      }
      
      toast.success(t('users.toasts.updated'));
      setIsFormOpen(false);
      setFormUser(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(t('users.errors.updateFailed'));
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormUser({ ...user, originalRole: user.role });
    setIsFormOpen(true);
  };

  const getUserRoleKey = (value) => {
    const v = String(value || '').toLowerCase();
    if (v === 'admin') return 'admin';
    if (v === 'student') return 'student';
    if (v === 'instructor') return 'instructor';
    return null;
  };

  const renderUserRole = (value) => {
    const key = getUserRoleKey(value);
    if (!key) return String(value ?? t('common.user'));
    return t(`enums.userRole.${key}`);
  };

  const columns = [
    {
      key: 'name',
      header: t('users.table.name'),
      sortable: true,
      render: (_, user) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.fullName || getFullName(user.firstName, user.lastName)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.table.role'),
      render: (value) => (
        <Badge className={getRoleColor(value)}>{renderUserRole(value)}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: t('users.table.created'),
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: t('users.table.actions'),
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => handleEdit(user)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700"
            onClick={() => setDeleteModal({ isOpen: true, user })}
          >
            {t('common.delete')}
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
          <Breadcrumb items={[{ labelKey: 'nav.users', href: '/users', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {t('nav.users')}
          </h1>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder={t('users.searchPlaceholder')}
            className="w-full sm:w-80"
          />
        </div>

        <Table
          columns={columns}
          data={sortedUsers}
          isLoading={isLoading}
          emptyMessage={t('users.empty')}
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
        title={t('users.form.editTitle')}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label={t('users.form.fullName')}
            value={formUser?.fullName || ''}
            onChange={(e) =>
              setFormUser({ ...formUser, fullName: e.target.value })
            }
          />
          <Input
            label={t('common.email')}
            type="email"
            value={formUser?.email || ''}
            onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
            disabled
          />
          <Input
            label={t('users.form.address')}
            value={formUser?.address || ''}
            onChange={(e) => setFormUser({ ...formUser, address: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('users.form.role')}
            </label>
            <select
              value={formUser?.role || ''}
              onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('users.form.selectRole')}</option>
              <option value="Admin">{t('enums.userRole.admin')}</option>
              <option value="Student">{t('enums.userRole.student')}</option>
              <option value="Instructor">{t('enums.userRole.instructor')}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setFormUser(null);
              }}
              disabled={isFormLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isFormLoading}>
              {t('users.form.updateAction')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        title={t('users.confirmDeleteTitle')}
        message={t('users.confirmDeleteMessage', {
          name: deleteModal.user?.fullName || t('users.confirmDeleteNameFallback'),
        })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </div>
  );
};

export default UsersPage;
