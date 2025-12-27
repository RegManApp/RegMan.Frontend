import { Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Avatar,
  Button,
  Table,
} from '../common';
import { getFullName, getStatusColor, formatDate } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

const StudentDetails = ({ student, onEdit, onBack }) => {
  const { t } = useTranslation();
  if (!student) return null;

  // Get the full name from either fullName or user.fullName
  const studentName = student.fullName || student.user?.fullName || getFullName(student.user?.firstName, student.user?.lastName);
  const studentEmail = student.email || student.user?.email;
  const initials = studentName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

  const enrollmentColumns = [
    {
      key: 'course',
      header: 'Course',
      render: (_, enrollment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {enrollment.course?.name || enrollment.course?.courseName || enrollment.courseName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {enrollment.course?.courseCode || enrollment.courseCode}
          </p>
        </div>
      ),
    },
    {
      key: 'enrollmentDate',
      header: 'Enrolled On',
      render: (_, enrollment) => formatDate(enrollment.enrolledAt || enrollment.enrollmentDate),
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value) => value || t('common.notAvailable'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">
                {initials}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                ID: {student.studentProfile?.studentId || student.id?.substring(0, 8) || t('common.notAvailable')}
              </p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                {student.role || t('enums.userRole.student')}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Link to={`/students/${student.id || student.studentProfile?.id}/gpa`}>
              <Button variant="outline">
                View GPA Details
              </Button>
            </Link>
            <Button onClick={() => onEdit?.(student)}>
              Edit Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Email
            </h4>
            <p className="mt-1 text-gray-900 dark:text-white">
              {studentEmail}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Address
            </h4>
            <p className="mt-1 text-gray-900 dark:text-white">
              {student.address || 'Not provided'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Completed Credits
            </h4>
            <p className="mt-1 text-gray-900 dark:text-white font-semibold">
              {student.studentProfile?.completedCredits || 0}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Registered Credits
            </h4>
            <p className="mt-1 text-gray-900 dark:text-white">
              {student.studentProfile?.registeredCredits || 0}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              GPA
            </h4>
            <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
              {(student.studentProfile?.gpa || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Academic Standing
            </h4>
            <Badge className={
              (student.studentProfile?.gpa || 0) >= 3.5 ? 'bg-green-100 text-green-800' :
              (student.studentProfile?.gpa || 0) >= 2.0 ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }>
              {(student.studentProfile?.gpa || 0) >= 3.5 ? 'Dean\'s List' :
               (student.studentProfile?.gpa || 0) >= 2.0 ? 'Good Standing' :
               'Academic Probation'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Enrollments */}
      <Card title="Course Enrollments">
        {student.enrollments && student.enrollments.length > 0 ? (
          <Table
            columns={enrollmentColumns}
            data={student.enrollments}
            emptyMessage="No enrollments found."
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            This student is not enrolled in any courses.
          </p>
        )}
      </Card>
    </div>
  );
};

export default StudentDetails;
