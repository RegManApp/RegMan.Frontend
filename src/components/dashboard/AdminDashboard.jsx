import { Link } from 'react-router-dom';
import { useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

const AdminDashboard = ({
  stats,
  recentEnrollments = [],
  recentStudents = [],
  isLoading,
}) => {
  const { t } = useTranslation();

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

  const renderStudentLevel = (value) => {
    const v = Number(value);
    const key = v === 0 ? 'freshman'
      : v === 1 ? 'sophomore'
        : v === 2 ? 'junior'
          : v === 3 ? 'senior'
            : null;
    if (!key) return t('common.notAvailable');
    return t(`enums.studentLevel.${key}`);
  };

  const enrollmentColumns = useMemo(() => ([
    {
      key: 'student',
      header: t('dashboard.admin.table.student'),
      render: (_, enrollment) => {
        const user = enrollment.student?.user;
        const name = user?.firstName || user?.lastName
          ? getFullName(user?.firstName, user?.lastName)
          : user?.fullName || enrollment.student?.fullName || t('common.notAvailable');
        return <span className="font-medium">{name}</span>;
      },
    },
    {
      key: 'course',
      header: t('dashboard.admin.table.course'),
      render: (_, enrollment) => enrollment.course?.courseName || t('common.notAvailable'),
    },
    {
      key: 'enrollmentDate',
      header: t('dashboard.admin.table.date'),
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      header: t('dashboard.admin.table.status'),
      render: (value) => (
        <Badge className={getStatusColor(value)} size="sm">
          {renderEnrollmentStatus(value)}
        </Badge>
      ),
    },
  ]), [t]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.admin.stats.totalStudents')}
          value={stats?.totalStudents || 0}
          icon={UsersIcon}
          trend={stats?.studentGrowth}
          trendLabel={t('dashboard.admin.stats.vsLastMonth')}
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title={t('dashboard.admin.stats.totalCourses')}
          value={stats?.totalCourses || 0}
          icon={BookOpenIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title={t('dashboard.admin.stats.activeEnrollments')}
          value={stats?.totalEnrollments || 0}
          icon={ClipboardDocumentListIcon}
          trend={stats?.enrollmentGrowth}
          trendLabel={t('dashboard.admin.stats.vsLastMonth')}
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title={t('dashboard.admin.stats.totalUsers')}
          value={stats?.totalUsers || 0}
          icon={UserGroupIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Quick Actions */}
      <Card title={t('dashboard.admin.quickActions.title')}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link to="/students">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              {t('dashboard.admin.quickActions.addStudent')}
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              {t('dashboard.admin.quickActions.createCourse')}
            </Button>
          </Link>
          <Link to="/enrollments">
            <Button variant="outline" className="w-full justify-start" icon={PlusIcon}>
              {t('dashboard.admin.quickActions.newEnrollment')}
            </Button>
          </Link>
          <Link to="/instructors">
            <Button variant="outline" className="w-full justify-start" icon={AcademicCapIcon}>
              {t('dashboard.admin.quickActions.instructors')}
            </Button>
          </Link>
          <Link to="/users">
            <Button variant="outline" className="w-full justify-start" icon={UserGroupIcon}>
              {t('dashboard.admin.quickActions.manageUsers')}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={t('dashboard.admin.recentEnrollments.title')}
          actions={
            <Link to="/enrollments">
              <Button variant="ghost" size="sm">
                {t('common.viewAll')}
              </Button>
            </Link>
          }
        >
          <Table
            columns={enrollmentColumns}
            data={recentEnrollments.slice(0, 5)}
            isLoading={isLoading}
            emptyMessage={t('dashboard.admin.recentEnrollments.empty')}
          />
        </Card>

        <Card
          title={t('dashboard.admin.recentStudents.title')}
          actions={
            <Link to="/students">
              <Button variant="ghost" size="sm">
                {t('common.viewAll')}
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {recentStudents.slice(0, 5).map((student) => {
              const fullName = student?.fullName || student?.FullName || student?.user?.fullName || student?.user?.FullName;
              const email = student?.email || student?.Email;
              const studentLevel = student?.studentLevel ?? student?.StudentLevel;
              const studentNumber =
                student?.studentNumber ??
                student?.StudentNumber ??
                student?.studentProfile?.studentId ??
                student?.StudentProfile?.StudentId ??
                '';

              // Try to get initials from first/last, else from fullName
              const initials = student.user?.firstName || student.user?.lastName
                ? `${student.user?.firstName?.[0] || ''}${student.user?.lastName?.[0] || ''}`
                : (String(fullName || email || '').split(' ').filter(Boolean).map(n => n[0]).join('') || t('common.initialsFallback'));
              // Prefer first/last, else fullName
              const name = student.user?.firstName || student.user?.lastName
                ? getFullName(student.user?.firstName, student.user?.lastName)
                : fullName || email || t('common.notAvailable');
              return (
                <div
                  key={student.id || student.Id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {studentNumber}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStudentLevelColor(studentLevel)} size="sm">
                    {renderStudentLevel(studentLevel)}
                  </Badge>
                </div>
              );
            })}
            {recentStudents.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                {t('dashboard.admin.recentStudents.empty')}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
