import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Table, Badge } from '../common';
import StatsCard from './StatsCard';
import { getFullName, formatDate, getStatusColor, getStudentLevelColor } from '../../utils/helpers';
import { getEnrollmentStatusLabel, getStudentLevelLabel } from '../../utils/constants';

const AdminDashboard = ({
  stats,
  recentEnrollments = [],
  recentStudents = [],
  isLoading,
}) => {
  const enrollmentColumns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, enrollment) => (
        <span className="font-medium">
          {getFullName(
            enrollment.student?.user?.firstName,
            enrollment.student?.user?.lastName
          )}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, enrollment) => enrollment.course?.courseName,
    },
    {
      key: 'enrollmentDate',
      header: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value)} size="sm">
          {getEnrollmentStatusLabel(value)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={UsersIcon}
          trend={stats?.studentGrowth}
          trendLabel="vs last month"
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpenIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Active Enrollments"
          value={stats?.totalEnrollments || 0}
          icon={ClipboardDocumentListIcon}
          trend={stats?.enrollmentGrowth}
          trendLabel="vs last month"
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={UserGroupIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link to="/students">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              Add Student
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              Create Course
            </Button>
          </Link>
          <Link to="/enrollments">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              New Enrollment
            </Button>
          </Link>
          <Link to="/instructors">
            <Button variant="outline" className="w-full justify-start" icon={AcademicCapIcon}>
              Instructors
            </Button>
          </Link>
          <Link to="/users">
            <Button variant="outline" className="w-full justify-start" icon={UserGroupIcon}>
              Manage Users
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Enrollments"
          actions={
            <Link to="/enrollments">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          }
        >
          <Table
            columns={enrollmentColumns}
            data={recentEnrollments.slice(0, 5)}
            isLoading={isLoading}
            emptyMessage="No recent enrollments"
          />
        </Card>

        <Card
          title="Recent Students"
          actions={
            <Link to="/students">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {recentStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {student.user?.firstName?.[0]}
                      {student.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getFullName(student.user?.firstName, student.user?.lastName)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.studentNumber}
                    </p>
                  </div>
                </div>
                <Badge className={getStudentLevelColor(student.studentLevel)} size="sm">
                  {getStudentLevelLabel(student.studentLevel)}
                </Badge>
              </div>
            ))}
            {recentStudents.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No students yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
