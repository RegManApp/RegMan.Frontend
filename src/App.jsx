import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, RoleGuard } from './components/auth';
import { Layout } from './components/Layout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  StudentsPage,
  CoursesPage,
  EnrollmentsPage,
  UsersPage,
  ProfilePage,
  NotFoundPage,
  InstructorsPage,
  InstructorDetailPage,
  SchedulesPage,
} from './pages';
import { ROLES } from './utils/constants';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - All authenticated users */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Students - Admin only */}
              <Route
                path="/students"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/students/:id"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />

              {/* Courses - All authenticated users */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CoursesPage />} />

              {/* Enrollments - All authenticated users */}
              <Route path="/enrollments" element={<EnrollmentsPage />} />

              {/* Users - Admin only */}
              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                    <UsersPage />
                  </RoleGuard>
                }
              />

              {/* Instructors - Admin only */}
              <Route
                path="/instructors"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                    <InstructorsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/instructors/:id"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                    <InstructorDetailPage />
                  </RoleGuard>
                }
              />

              {/* Schedules - Admin and Instructor */}
              <Route
                path="/schedules"
                element={
                  <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
                    <SchedulesPage />
                  </RoleGuard>
                }
              />

              {/* Profile - All authenticated users */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
