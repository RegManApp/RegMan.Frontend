import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatUnreadProvider } from './contexts/ChatUnreadContext';
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
  AdvisingPage,
  AnalyticsPage,
  ChatPage,
  OfficeHoursPage,
  BookOfficeHourPage,
  CalendarPage,
  GpaPage,
  AcademicPlanPage,   
  TranscriptPage,     
  AdminCartManagementPage,
  SectionPage,
  SettingsPage,
  NotificationsPage,
  SmartScheduleBuilderPage,
  WithdrawHistoryPage,
  WelcomePage
} from './pages';
import RoomPage from './pages/RoomPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import WithdrawRequestPage from './pages/WithdrawRequestPage';
import AdminWithdrawRequestsPage from './pages/AdminWithdrawRequestsPage';
import CartPage from './pages/CartPage';
import TimeSlotPage from './pages/TimeSlotPage';

import { ROLES } from './utils/constants';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatUnreadProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<WelcomePage />} />
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

                <Route
                  path="/academic-plan"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.STUDENT]}>
                      <AcademicPlanPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/transcript"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.STUDENT]}>
                      <TranscriptPage />
                    </RoleGuard>
                  }
                />

                <Route
                  path="/sections"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <SectionPage />
                    </RoleGuard>
                  }
                />

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

                {/* Advising - Admin and Instructor */}
                <Route
                  path="/advising"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
                      <AdvisingPage />
                    </RoleGuard>
                  }
                />

                {/* Analytics - Admin only */}
                <Route
                  path="/analytics"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <AnalyticsPage />
                    </RoleGuard>
                  }
                />

                {/* Calendar - All authenticated users */}
                <Route path="/calendar" element={<CalendarPage />} />

                {/* Office Hours - Instructor only */}
                <Route
                  path="/office-hours"
                  element={
                    <RoleGuard allowedRoles={[ROLES.INSTRUCTOR]}>
                      <OfficeHoursPage />
                    </RoleGuard>
                  }
                />

                {/* Book Office Hours - Student only */}
                <Route
                  path="/book-office-hours"
                  element={
                    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
                      <BookOfficeHourPage />
                    </RoleGuard>
                  }
                />

                {/* Profile - All authenticated users */}
                <Route path="/profile" element={<ProfilePage />} />
                {/* Chat - All authenticated users */}
                <Route path="/chat" element={<ChatPage />} />

                {/* Notifications - All authenticated users */}
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* GPA - Students view their own, Admin can view any student */}
                <Route
                  path="/gpa"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <GpaPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/students/:studentId/gpa"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.STUDENT]}>
                      <GpaPage />
                    </RoleGuard>
                  }
                />

                {/* Cart - Student only */}
                <Route
                  path="/cart"
                  element={
                    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
                      <CartPage />
                    </RoleGuard>
                  }
                />

                {/* Time Slots - Admin only */}
                <Route
                  path="/time-slots"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <TimeSlotPage />
                    </RoleGuard>
                  }
                />

                {/* Rooms - Admin only */}
                <Route
                  path="/rooms"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <RoomPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/rooms/:id"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <RoomDetailsPage />
                    </RoleGuard>
                  }
                />

                {/* Withdraw Request - Student only */}
                <Route
                  path="/withdraw-request"
                  element={
                    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
                      <WithdrawRequestPage />
                    </RoleGuard>
                  }
                />

                {/* Withdraw History - Student only */}
                <Route
                  path="/withdraw-history"
                  element={
                    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
                      <WithdrawHistoryPage />
                    </RoleGuard>
                  }
                />

                {/* Smart Schedule Builder - Student only */}
                <Route
                  path="/smart-schedule"
                  element={
                    <RoleGuard allowedRoles={[ROLES.STUDENT]}>
                      <SmartScheduleBuilderPage />
                    </RoleGuard>
                  }
                />

                {/* Admin Withdraw Requests - Admin only */}
                <Route
                  path="/admin/withdraw-requests"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <AdminWithdrawRequestsPage />
                    </RoleGuard>
                  }
                />

                {/* Admin Cart Management - Admin only */}
                <Route
                  path="/admin/carts"
                  element={
                    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                      <AdminCartManagementPage />
                    </RoleGuard>
                  }
                />

                {/* Settings - All authenticated users (admin-only sections are gated inside) */}
                <Route path="/settings" element={<SettingsPage />} />
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
        </ChatUnreadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
