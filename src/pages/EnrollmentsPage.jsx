import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentApi } from '../api/enrollmentApi';
import { studentApi } from '../api/studentApi';
import { courseApi } from '../api/courseApi';
import { EnrollmentList, EnrollmentForm } from '../components/enrollments';
import { PageLoading, Breadcrumb } from '../components/common';

const EnrollmentsPage = () => {
  const { isAdmin } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formEnrollment, setFormEnrollment] = useState(null);

  // Pagination, search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (isAdmin()) {
        response = await enrollmentApi.getAll({
          page,
          pageSize,
          search: searchQuery,
          status: statusFilter,
        });
      } else {
        response = await enrollmentApi.getMyEnrollments();
      }

      const data = response.data;
      setEnrollments(data.items || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || data.length);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter, isAdmin]);

  const loadFormData = useCallback(async () => {
    if (isAdmin()) {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          studentApi.getAll({ pageSize: 100 }),
          courseApi.getAll({ pageSize: 100 }),
        ]);
        setStudents(studentsRes.data?.items || studentsRes.data || []);
        setCourses(coursesRes.data?.items || coursesRes.data || []);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const handleEdit = (enrollment) => {
    setFormEnrollment(enrollment);
    setIsFormOpen(true);
  };

  const handleDelete = async (enrollmentId) => {
    try {
      await enrollmentApi.delete(enrollmentId);
      toast.success('Enrollment dropped successfully');
      loadEnrollments();
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
    }
  };

  const handleUpdateGrade = async (enrollmentId, grade) => {
    try {
      await enrollmentApi.updateGrade(enrollmentId, grade);
      toast.success('Grade updated successfully');
      loadEnrollments();
    } catch (error) {
      console.error('Failed to update grade:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      if (formEnrollment?.id) {
        await enrollmentApi.update(formEnrollment.id, data);
        toast.success('Enrollment updated successfully');
      } else {
        await enrollmentApi.create(data);
        toast.success('Enrollment created successfully');
      }
      setIsFormOpen(false);
      setFormEnrollment(null);
      loadEnrollments();
    } catch (error) {
      console.error('Failed to save enrollment:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  if (isLoading && !enrollments.length) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb
            items={[{ name: 'Enrollments', href: '/enrollments', current: true }]}
          />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {isAdmin() ? 'Enrollments' : 'My Enrollments'}
          </h1>
        </div>
      </div>

      <EnrollmentList
        enrollments={enrollments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateGrade={handleUpdateGrade}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        isAdmin={isAdmin()}
      />

      <EnrollmentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormEnrollment(null);
        }}
        onSubmit={handleFormSubmit}
        enrollment={formEnrollment}
        students={students}
        courses={courses}
        isLoading={isFormLoading}
      />
    </div>
  );
};

export default EnrollmentsPage;
