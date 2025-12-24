import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../api/studentApi';
import { userApi } from '../api/userApi';
import { StudentList, StudentForm, StudentDetails } from '../components/students';
import { PageLoading, Breadcrumb } from '../components/common';

const StudentsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStudent, setFormStudent] = useState(null);

  // Pagination & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await studentApi.getAll({
        page,
        pageSize,
        search: searchQuery,
      });
      const data = response.data;
      setStudents(data.items || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || data.length);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error(t('students.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  const loadStudentDetails = useCallback(async (studentId) => {
    setIsLoading(true);
    try {
      const response = await studentApi.getById(studentId);
      setSelectedStudent(response.data);
    } catch (error) {
      console.error('Failed to load student details:', error);
      toast.error(t('students.errors.detailsFetchFailed'));
      navigate('/students');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await userApi.getAll();
      setUsers(response.data?.items || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadStudentDetails(id);
    } else {
      loadStudents();
    }
  }, [id, loadStudents, loadStudentDetails]);

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleEdit = (student) => {
    setFormStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = async (studentId) => {
    try {
      await studentApi.delete(studentId);
      toast.success(t('students.toasts.deleted'));
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      if (formStudent?.id) {
        await studentApi.update(formStudent.id, data);
        toast.success(t('students.toasts.updated'));
      } else {
        await studentApi.create(data);
        toast.success(t('students.toasts.created'));
      }
      setIsFormOpen(false);
      setFormStudent(null);
      if (id) {
        loadStudentDetails(id);
      } else {
        loadStudents();
      }
    } catch (error) {
      console.error('Failed to save student:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  if (isLoading && !students.length && !selectedStudent) {
    return <PageLoading />;
  }

  // Detail view
  if (id && selectedStudent) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { name: 'Students', href: '/students' },
            { name: selectedStudent.studentNumber, href: `/students/${id}`, current: true },
          ]}
        />
        <StudentDetails
          student={selectedStudent}
          onEdit={handleEdit}
          onBack={() => navigate('/students')}
        />
        <StudentForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormStudent(null);
          }}
          onSubmit={handleFormSubmit}
          student={formStudent}
          users={users}
          isLoading={isFormLoading}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ name: 'Students', href: '/students', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
        </div>
      </div>

      <StudentList
        students={students}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormStudent(null);
        }}
        onSubmit={handleFormSubmit}
        student={formStudent}
        users={users}
        isLoading={isFormLoading}
      />
    </div>
  );
};

export default StudentsPage;
