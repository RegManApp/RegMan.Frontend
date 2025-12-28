import { useState, useEffect, useCallback } from 'react';
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
import gpaApi from '../api/gpaApi';
import { normalizeCourses } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { user, isAdmin, isStudent, isInstructor } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [currentGpa, setCurrentGpa] = useState(null);
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [instructorSchedules, setInstructorSchedules] = useState([]);
  const [timeline, setTimeline] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
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
        const [profileRes, enrollmentsRes, coursesRes, timelineRes, gpaRes] = await Promise.all([
          studentApi.getMyProfile().catch(() => ({ data: null })),
          enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })),
          courseApi.getAvailable().catch(() => ({ data: [] })),
          calendarApi.getTimeline().catch(() => null),
          gpaApi.getMyGPA().catch(() => ({ data: null })),
        ]);

        setStudentProfile(profileRes.data || profileRes);
        const enrollmentsData = enrollmentsRes?.data ?? enrollmentsRes;
        setMyEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.items || []));

        const coursesData = coursesRes?.data ?? coursesRes;
        const courseItems = Array.isArray(coursesData) ? coursesData : (coursesData?.items || coursesData?.Items || []);
        setAvailableCourses(normalizeCourses(Array.isArray(courseItems) ? courseItems : []));
        setTimeline(timelineRes);

        const gpaData = gpaRes?.data ?? gpaRes;
        const apiGpa = gpaData?.CurrentGPA ?? gpaData?.currentGPA ?? gpaData?.currentGpa ?? null;
        setCurrentGpa(typeof apiGpa === 'number' && Number.isFinite(apiGpa) ? apiGpa : null);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAdmin, isInstructor, isStudent]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[{ labelKey: 'nav.dashboard', href: '/dashboard', current: true }]} />
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {t('nav.dashboard')}
          </h1>
          <p className="mt-1 text-lg text-gray-700 dark:text-gray-300">
            {t('dashboard.page.welcomeUser', {
              name: user?.fullName || user?.email || t('common.user'),
            })}
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
          currentGpa={currentGpa}
          isLoading={isLoading}
          timeline={timeline}
        />
      )}
    </div>
  );
};

export default DashboardPage;
