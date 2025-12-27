import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  UserGroupIcon,
  TagIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  Button,
  Table,
  Avatar,
} from '../common';
import { getFullName, getStatusColor, formatDate } from '../../utils/helpers';

const CourseDetails = ({
  course,
  enrolledStudents = [],
  onEdit,
  onEnroll,
  onUnenroll,
  onBack,
  isAdmin,
  isEnrolled,
  isLoadingStudents,
}) => {
  const { t } = useTranslation();

  if (!course) return null;

  // Robust fallback for category and description
  const categoryName = course.categoryName || course.CourseCategoryName || course.category?.name || course.Category?.Name || t('common.notAvailable');
  const description = course.description || course.Description || '';

  const getEnrollmentStatusKey = (value) => {
    if (typeof value === 'number') {
      if (value === 0) return 'pending';
      if (value === 1) return 'enrolled';
      if (value === 2) return 'dropped';
      if (value === 3) return 'completed';
      if (value === 4) return 'declined';
      return null;
    }
    const v = String(value || '').toLowerCase();
    if (v.includes('pending')) return 'pending';
    if (v.includes('enrolled')) return 'enrolled';
    if (v.includes('dropped')) return 'dropped';
    if (v.includes('completed')) return 'completed';
    if (v.includes('declined')) return 'declined';
    return null;
  };

  const renderEnrollmentStatus = (value) => {
    const key = getEnrollmentStatusKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.enrollmentStatus.${key}`);
  };

  const studentColumns = [
    {
      key: 'student',
      header: t('courses.details.enrolledStudents.table.student'),
      render: (_, enrollment) => (
        <div className="flex items-center gap-3">
          <Avatar
            firstName={enrollment.student?.user?.firstName}
            lastName={enrollment.student?.user?.lastName}
            size="sm"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {getFullName(
                enrollment.student?.user?.firstName,
                enrollment.student?.user?.lastName
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {enrollment.student?.studentNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'semester',
      header: t('courses.details.enrolledStudents.table.semester'),
      render: (value) => value || t('common.notAvailable'),
    },
    {
      key: 'enrollmentDate',
      header: t('courses.details.enrolledStudents.table.enrolledOn'),
      render: (value) => formatDate(value),
    },
    {
      key: 'grade',
      header: t('courses.details.enrolledStudents.table.grade'),
      render: (value) => value || t('common.notAvailable'),
    },
    {
      key: 'status',
      header: t('courses.details.enrolledStudents.table.status'),
      render: (value) => (
        <Badge className={getStatusColor(value)}>{renderEnrollmentStatus(value)}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Course Info Card */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="primary">{course.courseCode}</Badge>
              {categoryName && categoryName !== '-' && (
                <Badge variant="secondary">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {categoryName}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {course.courseName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {description ? description : <span className="italic text-gray-400">{t('courses.noDescription')}</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBack}>
              {t('common.back')}
            </Button>
            {isAdmin ? (
              <Button onClick={() => onEdit?.(course)}>{t('courses.actions.edit')}</Button>
            ) : isEnrolled ? (
              <Button variant="danger" onClick={() => onUnenroll?.(course.id)}>
                {t('courses.drop')}
              </Button>
            ) : (
              <Button onClick={() => onEnroll?.(course.id)}>
                {t('courses.enroll')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BookOpenIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('courses.details.creditHours')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {course.creditHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('courses.details.enrolled')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('courses.details.enrolledCount', { count: course.enrollmentCount || 0 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('courses.details.category')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {categoryName}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrolled Students (Admin only) */}
      {isAdmin && (
        <Card
          title={t('courses.details.enrolledStudents.title')}
          subtitle={t('courses.details.enrolledStudents.subtitle', { count: enrolledStudents.length })}
        >
          <Table
            columns={studentColumns}
            data={enrolledStudents}
            isLoading={isLoadingStudents}
            emptyMessage={t('courses.details.enrolledStudents.empty')}
          />
        </Card>
      )}
    </div>
  );
};

export default CourseDetails;
