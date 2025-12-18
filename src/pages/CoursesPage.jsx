import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { courseApi } from '../api/courseApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { CourseList, CourseCard, CourseForm, CourseDetails } from '../components/courses';
import { PageLoading, Breadcrumb, Button } from '../components/common';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const CoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formCourse, setFormCourse] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Pagination & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await courseApi.getAll({
        page,
        pageSize,
        search: searchQuery,
      });
      const data = response.data;
      setCourses(data.items || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || data.length);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  const loadCourseDetails = useCallback(async (courseId) => {
    setIsLoading(true);
    try {
      const response = await courseApi.getById(courseId);
      setSelectedCourse(response.data);

      // Load enrolled students for admin
      if (isAdmin()) {
        setIsLoadingStudents(true);
        try {
          const studentsRes = await courseApi.getEnrolledStudents(courseId);
          setEnrolledStudents(studentsRes.data || []);
        } catch (err) {
          console.error('Failed to load enrolled students:', err);
        } finally {
          setIsLoadingStudents(false);
        }
      }
    } catch (error) {
      console.error('Failed to load course details:', error);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, isAdmin]);

  const loadMyEnrollments = useCallback(async () => {
    if (!isAdmin()) {
      try {
        const response = await enrollmentApi.getMyEnrollments();
        setMyEnrollments(response.data || []);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    if (id) {
      loadCourseDetails(id);
    } else {
      loadCourses();
    }
  }, [id, loadCourses, loadCourseDetails]);

  useEffect(() => {
    loadMyEnrollments();
  }, [loadMyEnrollments]);

  const isEnrolled = (courseId) => {
    return myEnrollments.some(
      (e) => e.courseId === courseId && e.status === 'Enrolled'
    );
  };

  const handleEdit = (course) => {
    setFormCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = async (courseId) => {
    try {
      await courseApi.delete(courseId);
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentApi.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course');
      loadMyEnrollments();
      if (id) {
        loadCourseDetails(id);
      } else {
        loadCourses();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await enrollmentApi.unenrollFromCourse(courseId);
      toast.success('Successfully dropped course');
      loadMyEnrollments();
      if (id) {
        loadCourseDetails(id);
      } else {
        loadCourses();
      }
    } catch (error) {
      console.error('Failed to unenroll:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    try {
      if (formCourse?.id) {
        await courseApi.update(formCourse.id, data);
        toast.success('Course updated successfully');
      } else {
        await courseApi.create(data);
        toast.success('Course created successfully');
      }
      setIsFormOpen(false);
      setFormCourse(null);
      if (id) {
        loadCourseDetails(id);
      } else {
        loadCourses();
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  if (isLoading && !courses.length && !selectedCourse) {
    return <PageLoading />;
  }

  // Detail view
  if (id && selectedCourse) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { name: 'Courses', href: '/courses' },
            { name: selectedCourse.courseName, href: `/courses/${id}`, current: true },
          ]}
        />
        <CourseDetails
          course={selectedCourse}
          enrolledStudents={enrolledStudents}
          onEdit={handleEdit}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
          onBack={() => navigate('/courses')}
          isAdmin={isAdmin()}
          isEnrolled={isEnrolled(selectedCourse.id)}
          isLoadingStudents={isLoadingStudents}
        />
        <CourseForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormCourse(null);
          }}
          onSubmit={handleFormSubmit}
          course={formCourse}
          isLoading={isFormLoading}
        />
      </div>
    );
  }

  // List/Grid view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ name: 'Courses', href: '/courses', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Courses
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <CourseList
          courses={courses}
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
          isAdmin={isAdmin()}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
            {isAdmin() && (
              <Button onClick={() => handleEdit({})}>Create Course</Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEdit}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                isAdmin={isAdmin()}
                isEnrolled={isEnrolled(course.id)}
              />
            ))}
          </div>
        </div>
      )}

      <CourseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormCourse(null);
        }}
        onSubmit={handleFormSubmit}
        course={formCourse}
        isLoading={isFormLoading}
      />
    </div>
  );
};

export default CoursesPage;
