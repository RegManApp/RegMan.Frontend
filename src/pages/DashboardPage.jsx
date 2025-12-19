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
          const instructorsRes = await instructorApi.getAll({ userId: user?.id });
          const instructors = instructorsRes.items || instructorsRes || [];
          const instructor = instructors[0];
          
          if (instructor) {
            setInstructorProfile(instructor);
            const schedulesRes = await scheduleApi.getByInstructor(instructor.id);
            setInstructorSchedules(Array.isArray(schedulesRes) ? schedulesRes : schedulesRes.items || []);
          }
        } catch (error) {
          console.error('Failed to load instructor data:', error);
        }
      } else {
        // Load student dashboard data
        const [profileRes, enrollmentsRes, coursesRes] = await Promise.all([
          studentApi.getMyProfile().catch(() => ({ data: null })),
          enrollmentApi.getMyEnrollments().catch(() => ({ data: [] })),
          courseApi.getAvailable().catch(() => ({ data: [] })),
        ]);

        setStudentProfile(profileRes.data || profileRes);
        setMyEnrollments(enrollmentsRes.data || enrollmentsRes || []);
        setAvailableCourses(coursesRes.data || coursesRes || []);
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
        />
      ) : (
        <StudentDashboard
          student={studentProfile}
          enrollments={myEnrollments}
          availableCourses={availableCourses}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DashboardPage;
