import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard, StudentDashboard, InstructorDashboard } from '../components/dashboard';
import { PageLoading, Breadcrumb } from '../components/common';
import { userApi } from '../api/userApi';
import { studentApi } from '../api/studentApi';
import { enrollmentApi } from '../api/enrollmentApi';
import { courseApi } from '../api/courseApi';
import { instructorApi } from '../api/instructorApi';
import { scheduleApi } from '../api/scheduleApi';
import { calendarApi } from '../api/calendarApi';
import { normalizeCourses } from '../utils/helpers';

const DashboardPage = () => {
  const { user, isAdmin, isStudent, isInstructor } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [instructorSchedules, setInstructorSchedules] = useState([]);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (isAdmin()) {
        // Load admin dashboard data
        const [statsRes, enrollmentsRes, studentsRes] = await Promise.all([
          userApi.getStats().catch(() => ({ data: {} })),
          enrollmentApi.getAll({ pageSize: 10 }).catch(() => ({ data: [] })),
          studentApi.getAll({ pageSize: 10 }).catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data || statsRes);
        setRecentEnrollments(enrollmentsRes.data?.items || enrollmentsRes.data || enrollmentsRes.items || []);
        setRecentStudents(studentsRes.data?.items || studentsRes.data || studentsRes.items || []);
      } else if (isInstructor()) {
        // Load instructor dashboard data
        try {
          const [schedulesRes, timelineRes] = await Promise.all([
            instructorApi.getMySchedule().catch(() => ({ data: [] })),
            calendarApi.getTimeline().catch(() => null),
          ]);

          const schedules = schedulesRes?.data ?? schedulesRes;
          setInstructorSchedules(Array.isArray(schedules) ? schedules : schedules?.items || []);
          setInstructorProfile(null);
          setTimeline(timelineRes);
        } catch (error) {
          console.error('Failed to load instructor data:', error);
        }
      } else {
        // Load student dashboard data
        const [profileRes, enrollmentsRes, coursesRes, timelineRes] = await Promise.all([
          studentApi.getMyProfile().catch(() => ({ data: null })),
          enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })),
          courseApi.getAvailable().catch(() => ({ data: [] })),
          calendarApi.getTimeline().catch(() => null),
        ]);

        setStudentProfile(profileRes.data || profileRes);
        setMyEnrollments(enrollmentsRes.data || enrollmentsRes || []);
        const coursesData = coursesRes.data || coursesRes || [];
        setAvailableCourses(normalizeCourses(Array.isArray(coursesData) ? coursesData : coursesData.items || []));
        setTimeline(timelineRes);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ name: 'Dashboard', href: '/dashboard', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-lg text-gray-700 dark:text-gray-300">
            Welcome, {user?.fullName || user?.email || 'User'}
          </p>
        </div>
      </div>

      {isAdmin() ? (
        <AdminDashboard
          stats={stats}
          recentEnrollments={recentEnrollments}
          recentStudents={recentStudents}
          isLoading={isLoading}
        />
      ) : isInstructor() ? (
        <InstructorDashboard
          instructor={instructorProfile}
          schedules={instructorSchedules}
          isLoading={isLoading}
          user={user}
          timeline={timeline}
        />
      ) : (
        <StudentDashboard
          student={studentProfile}
          enrollments={myEnrollments}
          availableCourses={availableCourses}
          isLoading={isLoading}
          timeline={timeline}
        />
      )}
    </div>
  );
};

export default DashboardPage;
