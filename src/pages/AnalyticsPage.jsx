import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api/analyticsApi';
import {
  PageLoading,
  Breadcrumb,
  Card,
  Badge,
} from '../components/common';
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [dashboard, setDashboard] = useState(null);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [gpaDistribution, setGpaDistribution] = useState(null);
  const [creditsDistribution, setCreditsDistribution] = useState(null);
  const [instructorStats, setInstructorStats] = useState([]);
  const [sectionCapacity, setSectionCapacity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }

    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const [
          dashboardRes,
          trendsRes,
          courseRes,
          gpaRes,
          creditsRes,
          instructorRes,
          capacityRes,
        ] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getEnrollmentTrends(),
          analyticsApi.getCourseStats(),
          analyticsApi.getGPADistribution(),
          analyticsApi.getCreditsDistribution(),
          analyticsApi.getInstructorStats(),
          analyticsApi.getSectionCapacity(),
        ]);

        setDashboard(dashboardRes.data);
        setEnrollmentTrends(trendsRes.data || []);
        setCourseStats(courseRes.data || []);
        setGpaDistribution(gpaRes.data);
        setCreditsDistribution(creditsRes.data);
        setInstructorStats(instructorRes.data || []);
        setSectionCapacity(capacityRes.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [isAdmin, navigate]);

  if (isLoading) {
    return <PageLoading />;
  }

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ name: 'Analytics', href: '/analytics', current: true }]} />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          System Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Comprehensive overview of the student management system
        </p>
      </div>

      {/* Overview Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="!p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboard.users?.total || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Students</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {dashboard.users?.students || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Courses</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {dashboard.courses?.total || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Enrollments</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboard.enrollments?.total || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enrollment Trends Chart */}
      {enrollmentTrends.length > 0 && (
        <Card title="Enrollment Trends (Last 30 Days)">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Total"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Approved"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Pending"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="declined" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Declined"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* GPA & Credits Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution Pie Chart */}
        {gpaDistribution?.chartData && (
          <Card title={`GPA Distribution (Avg: ${gpaDistribution.summary?.averageGPA || 0})`}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gpaDistribution.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gpaDistribution.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Credits Distribution Bar Chart */}
        {creditsDistribution?.chartData && (
          <Card title={`Student Classification (Avg Credits: ${creditsDistribution.summary?.averageCredits || 0})`}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditsDistribution.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value, name, props) => [value, props.payload.range]}
                  />
                  <Bar dataKey="value" name="Students">
                    {creditsDistribution.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* User Breakdown & Enrollment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        {dashboard?.users && (
          <Card title="User Breakdown">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Students</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.students}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Instructors</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.instructors}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">Administrators</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dashboard.users.admins}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Enrollment Status */}
        {dashboard?.enrollments && (
          <Card title="Enrollment Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">Pending Approval</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {dashboard.enrollments.pending}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Active Enrollments</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {dashboard.enrollments.active}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">Declined</span>
                </div>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {dashboard.enrollments.declined}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Top Courses */}
      {courseStats.length > 0 && (
        <Card title="Top Courses by Enrollment">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sections
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {courseStats.map((course) => (
                  <tr key={course.courseId}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.courseName}</p>
                        <p className="text-sm text-gray-500">{course.courseCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{course.credits}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{course.sectionCount}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {course.totalEnrollments}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {course.activeEnrollments}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {course.pendingEnrollments}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Top Instructors with Bar Chart */}
      {instructorStats.length > 0 && (
        <Card title="Top Instructors by Student Count">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={instructorStats.slice(0, 5)} 
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="fullName" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="totalStudents" fill="#8B5CF6" name="Students" />
                  <Bar dataKey="sectionsCount" fill="#3B82F6" name="Sections" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Instructor</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sections</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {instructorStats.map((instructor) => (
                    <tr key={instructor.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{instructor.fullName}</p>
                          <p className="text-sm text-gray-500">{instructor.department || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                        {instructor.sectionsCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {instructor.totalStudents}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Section Capacity */}
      {sectionCapacity?.summary && (
        <Card title="Section Capacity Overview">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sectionCapacity.summary.totalSections}</p>
              <p className="text-sm text-gray-500">Total Sections</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{sectionCapacity.summary.fullSections}</p>
              <p className="text-sm text-gray-500">Full</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{sectionCapacity.summary.almostFullSections}</p>
              <p className="text-sm text-gray-500">Almost Full</p>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{sectionCapacity.summary.emptySections}</p>
              <p className="text-sm text-gray-500">Empty</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{sectionCapacity.summary.averageUtilization}%</p>
              <p className="text-sm text-gray-500">Avg. Utilization</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
