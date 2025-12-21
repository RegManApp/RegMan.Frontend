import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { courseApi } from '../api/courseApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { CourseList, CourseCard, CourseForm, CourseDetails } from '../components/courses';
import { PageLoading, Breadcrumb, Button } from '../components/common';
import { normalizeCourse, normalizeCourses, normalizeCategories } from '../utils/helpers';
import { courseCategoryApi } from '../api/courseCategoryApi';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import adminApi from '../api/adminApi';
import cartApi from '../api/cartApi';

const CoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formCourse, setFormCourse] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;
  const [registrationEndDate, setRegistrationEndDate] = useState("");

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        pageSize,
        search: searchQuery,
      };
      if (categoryFilter) params.courseCategoryId = categoryFilter;
      const response = await courseApi.getAll(params);
      const data = response.data;
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data?.items) {
        items = data.items;
      } else if (data?.Items) {
        items = data.Items;
      } else if (data) {
        items = [data];
      }
      setCourses(normalizeCourses(items));
      setTotalPages(data?.totalPages || data?.TotalPages || 1);
      setTotalItems(data?.totalItems || data?.TotalItems || items.length || 0);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, categoryFilter]);

  // Load categories for filter and forms
  const loadCategories = useCallback(async () => {
    try {
      const res = await courseCategoryApi.getAll();
      const data = res.data || res || [];
      setCategories(normalizeCategories(Array.isArray(data) ? data : data.items || []));
    } catch (e) {
      setCategories([]);
    }
  }, []);

  const loadCourseDetails = useCallback(async (courseId) => {
    setIsLoading(true);
    try {
      // Ensure courseId is a valid number
      const numericId = Number(courseId);
      if (isNaN(numericId) || numericId <= 0) {
        throw new Error('Invalid course ID');
      }
      const response = await courseApi.getById(numericId);
      setSelectedCourse(normalizeCourse(response.data));

      // Load enrolled students for admin
      if (isAdmin()) {
        setIsLoadingStudents(true);
        try {
          const studentsRes = await courseApi.getEnrolledStudents(numericId);
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
        const enrollments = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.items) ? response.data.items : []);
        setMyEnrollments(enrollments);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
      }
    }
  }, [isAdmin]);

  const { isStudent } = useAuth();
  const loadCartItems = useCallback(async () => {
    if (!isStudent()) return;
    try {
      const response = await cartApi.viewCart();
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      }
      setCartItems(items);
    } catch (error) {
      setCartItems([]);
    }
  }, [isStudent]);

  useEffect(() => {
    if (id) {
      loadCourseDetails(id);
    } else {
      loadCourses();
    }
  }, [id, loadCourses, loadCourseDetails]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadMyEnrollments();
  }, [loadMyEnrollments]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  useEffect(() => {
    adminApi.getRegistrationEndDate().then((res) => {
      setRegistrationEndDate(res.data?.registrationEndDate || "");
    });
  }, []);

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

  // Helper to get cart/enrollment status for a course
  const getCartStatus = (courseId) => {
    const item = cartItems.find(
      (ci) => ci.courseId === courseId || ci.sectionId === courseId || ci.scheduleSlotId === courseId
    );
    return item ? 'added' : null;
  };
  const getEnrollmentStatus = (courseId) => {
    const enrollment = myEnrollments.find((e) => e.courseId === courseId);
    return enrollment ? enrollment.status : null;
  };
  const handleRemoveFromCart = async (courseId) => {
    const item = cartItems.find(
      (ci) => ci.courseId === courseId || ci.sectionId === courseId || ci.scheduleSlotId === courseId
    );
    if (item) {
      await cartApi.removeFromCart(item.cartItemId || item.id);
      toast.success('Removed from cart');
      loadCartItems();
    }
  };
  const handleDrop = async (courseId) => {
    const enrollment = myEnrollments.find((e) => e.courseId === courseId);
    if (enrollment) {
      await enrollmentApi.drop(enrollment.enrollmentId);
      toast.success('Course dropped');
      loadMyEnrollments();
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
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
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
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {isAdmin() && (
              <Button onClick={() => handleEdit({})}>Create Course</Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                cartStatus={getCartStatus(course.id)}
                enrollmentStatus={getEnrollmentStatus(course.id)}
                registrationEndDate={registrationEndDate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin()}
                isEnrolled={false}
                onRemoveFromCart={handleRemoveFromCart}
                onDrop={handleDrop}
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
