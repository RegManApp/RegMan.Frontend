import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  UserGroupIcon,
  TagIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  Badge,
  Button,
  Table,
  Avatar,
} from '../common';
import { getFullName, getStatusColor, formatDate } from '../../utils/helpers';
import { getEnrollmentStatusLabel } from '../../utils/constants';

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
  if (!course) return null;

  const studentColumns = [
    {
      key: 'student',
      header: 'Student',
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
      header: 'Semester',
      render: (value) => value || '-',
    },
    {
      key: 'enrollmentDate',
      header: 'Enrolled On',
      render: (value) => formatDate(value),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value) => value || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value)}>{getEnrollmentStatusLabel(value)}</Badge>
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
              {course.categoryName && (
                <Badge variant="secondary">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {course.categoryName}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {course.courseName}
            </h2>
            {course.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {course.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {isAdmin ? (
              <Button onClick={() => onEdit?.(course)}>Edit Course</Button>
            ) : isEnrolled ? (
              <Button variant="danger" onClick={() => onUnenroll?.(course.id)}>
                Drop Course
              </Button>
            ) : (
              <Button onClick={() => onEnroll?.(course.id)}>
                Enroll
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Credit Hours</p>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Enrolled</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {course.enrollmentCount || 0} students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {course.categoryName || '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrolled Students (Admin only) */}
      {isAdmin && (
        <Card title="Enrolled Students" subtitle={`${enrolledStudents.length} students enrolled`}>
          <Table
            columns={studentColumns}
            data={enrolledStudents}
            isLoading={isLoadingStudents}
            emptyMessage="No students enrolled in this course yet."
          />
        </Card>
      )}
    </div>
  );
};

export default CourseDetails;
