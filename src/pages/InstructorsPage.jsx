import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { instructorApi } from '../api';
import { InstructorList, InstructorForm } from '../components/instructors';
import { PageHeader } from '../components/common';
import { debounce } from '../utils/helpers';

const InstructorsPage = () => {
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
      
      if (response.items) {
        setInstructors(response.items);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalCount || 0);
      } else if (Array.isArray(response)) {
        setInstructors(response);
        setTotalPages(1);
        setTotalItems(response.length);
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      toast.error('Failed to load instructors');
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
    if (instructor?.id) {
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
      if (formModal.instructor?.id) {
        await instructorApi.update(formModal.instructor.id, data);
        toast.success('Instructor updated successfully');
      } else {
        await instructorApi.create(data);
        toast.success('Instructor created successfully');
      }
      handleCloseForm();
      fetchInstructors();
    } catch (error) {
      console.error('Failed to save instructor:', error);
      toast.error(error.message || 'Failed to save instructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (instructorId) => {
    try {
      await instructorApi.delete(instructorId);
      toast.success('Instructor deleted successfully');
      fetchInstructors();
    } catch (error) {
      console.error('Failed to delete instructor:', error);
      toast.error(error.message || 'Failed to delete instructor');
    }
  };

  const handleViewDetails = (instructor) => {
    navigate(`/instructors/${instructor.id}`);
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructors"
        description="Manage instructors and their information"
      />

      <InstructorList
        instructors={instructors}
        isLoading={isLoading}
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
