import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { instructorApi } from '../api';
import { InstructorList, InstructorForm } from '../components/instructors';
import { PageHeader } from '../components/common';
import { debounce } from '../utils/helpers';

const InstructorsPage = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Form modal state
  const [formModal, setFormModal] = useState({ isOpen: false, instructor: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInstructors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await instructorApi.getAll({
        page,
        pageSize,
        search: searchQuery,
      });
      
      // Response data is unwrapped by axios interceptor to response.data
      const data = response.data || response;
      let items = [];
      
      if (data?.items) {
        items = data.items;
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalCount || 0);
      } else if (Array.isArray(data)) {
        items = data;
        setTotalPages(1);
        setTotalItems(data.length);
      }
      
      // Normalize instructor data - ensure id field exists
      const normalizedInstructors = items.map(i => ({
        ...i,
        id: i.id || i.instructorId,
        instructorId: i.instructorId || i.id,
      }));
      setInstructors(normalizedInstructors);
    } catch (error) {
      console.error(error);
      toast.error(t('instructors.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setPage(1);
    }, 300),
    []
  );

  const handleSearchChange = (value) => {
    debouncedSearch(value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEdit = (instructor) => {
    if (instructor?.instructorId || instructor?.id) {
      setFormModal({ isOpen: true, instructor });
    } else {
      setFormModal({ isOpen: true, instructor: null });
    }
  };

  const handleCloseForm = () => {
    setFormModal({ isOpen: false, instructor: null });
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const instructorId = formModal.instructor?.instructorId || formModal.instructor?.id;
      if (instructorId) {
        await instructorApi.update(instructorId, data);
        toast.success(t('instructors.toasts.updated'));
      } else {
        await instructorApi.create(data);
        toast.success(t('instructors.toasts.created'));
      }
      handleCloseForm();
      fetchInstructors();
    } catch (error) {
      console.error(error);
      toast.error(t('instructors.errors.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (instructorId) => {
    try {
      await instructorApi.delete(instructorId);
      toast.success(t('instructors.toasts.deleted'));
      fetchInstructors();
    } catch (error) {
      console.error(error);
      toast.error(t('instructors.errors.deleteFailed'));
    }
  };

  const handleViewDetails = (instructor) => {
    navigate(`/instructors/${instructor.instructorId || instructor.id}`);
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('common.accessDeniedTitle')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('common.accessDeniedMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.instructors')}
        description={t('instructors.page.description')}
      />

      <InstructorList
        instructors={instructors}
        isLoading={isLoading}
        onCreate={() => handleEdit(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      <InstructorForm
        isOpen={formModal.isOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        instructor={formModal.instructor}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default InstructorsPage;
