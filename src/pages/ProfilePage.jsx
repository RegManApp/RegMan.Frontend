import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import { profileSchema, changePasswordSchema } from '../utils/validators';
import {
  Breadcrumb,
  Card,
  Button,
  Input,
  Avatar,
  Badge,
} from '../components/common';
import GpaWhatIf from '../components/gpa/GpaWhatIf';
import { getFullName, getRoleColor, formatDate } from '../utils/helpers';
import { sanitize } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Load full profile data (Student)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Use correct API for student profile
        const response = await authApi.getStudentMe();
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = async (data) => {
    setIsProfileLoading(true);
    try {
      await authApi.updateProfile(data);
      updateUser(data);
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsPasswordLoading(true);
    try {
      await authApi.changePassword(data);
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ name: 'Profile', href: '/profile', current: true }]} />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
      </div>

      {/* Profile Card */}
      <Card title="Personal Information">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="xl"
            />
          </div>

          {isEditingProfile ? (
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="flex-1 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  error={profileErrors.firstName?.message}
                  {...registerProfile('firstName')}
                />
                <Input
                  label="Last Name"
                  error={profileErrors.lastName?.message}
                  {...registerProfile('lastName')}
                />
              </div>
              <Input
                label="Email"
                type="email"
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />
              <div className="flex gap-3">
                <Button type="submit" loading={isProfileLoading}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    resetProfile();
                  }}
                  disabled={isProfileLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sanitize(getFullName(user?.firstName, user?.lastName))}
                </h2>
                <Badge className={getRoleColor(user?.role)}>
                  {user?.role || 'User'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{sanitize(user?.email)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title="Security">
        {isChangingPassword ? (
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="max-w-md space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              error={passwordErrors.confirmNewPassword?.message}
              {...registerPassword('confirmNewPassword')}
            />

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Password must contain:
              <ul className="mt-1 list-disc list-inside">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={isPasswordLoading}>
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  resetPassword();
                }}
                disabled={isPasswordLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Keep your account secure by using a strong password.
            </p>
            <Button onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          </div>
        )}
      </Card>

      {/* Admin Information */}
      {user?.role === 'Admin' && (
        <Card title="Administrator Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Admin Details
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  System Administrator
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Access Level</p>
                <p className="text-gray-900 dark:text-white">Full Access</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Permissions
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">User Management</Badge>
                <Badge className="bg-blue-100 text-blue-800">Course Management</Badge>
                <Badge className="bg-blue-100 text-blue-800">Enrollment Control</Badge>
                <Badge className="bg-blue-100 text-blue-800">System Settings</Badge>
                <Badge className="bg-blue-100 text-blue-800">Reports & Analytics</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/users'}>
                  👥 Manage Users
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/courses'}>
                  📚 Manage Courses
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/enrollments'}>
                  📋 View Enrollments
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Academic Information (for Students) */}
      {user?.role === 'Student' && profile?.profile && (
        <Card title="Academic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Program Information
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                <p className="text-gray-900 dark:text-white font-mono">{profile.profile.studentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                <p className="text-gray-900 dark:text-white">Undergraduate</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Degree</p>
                <p className="text-gray-900 dark:text-white">Bachelor of Science</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Curriculum</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.academicPlan?.academicPlanName || 'Not Assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">College</p>
                <p className="text-gray-900 dark:text-white">Information Technology</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-gray-900 dark:text-white">Computer Science</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Academic Progress
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed Credits</p>
                <p className="text-gray-900 dark:text-white font-semibold">{profile.profile.completedCredits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registered Credits</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.registeredCredits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Required Credits</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.academicPlan?.totalCreditHours || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((profile.profile.completedCredits || 0) / (profile.profile.academicPlan?.totalCreditHours || 120)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(((profile.profile.completedCredits || 0) / (profile.profile.academicPlan?.totalCreditHours || 120)) * 100)}% Complete
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Term Credit Limit</p>
                <p className="text-gray-900 dark:text-white">21.00</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                GPA & Status
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current GPA</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {profile.profile.gpa?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">out of 4.00</p>
              </div>
              {/* GPA What-If Calculator */}
              <div id="gpa-whatif" className="mt-4">
                <GpaWhatIf currentGpaFromProfile={profile.profile.gpa} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Academic Standing</p>
                <Badge className={
                  profile.profile.gpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  profile.profile.gpa >= 2.0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }>
                  {profile.profile.gpa >= 3.5 ? 'Dean\'s List' :
                   profile.profile.gpa >= 2.0 ? 'Good Standing' :
                   'Academic Probation'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Classification</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.completedCredits >= 90 ? 'Senior' :
                   profile.profile.completedCredits >= 60 ? 'Junior' :
                   profile.profile.completedCredits >= 30 ? 'Sophomore' :
                   'Freshman'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Graduation Status</p>
                <p className="text-gray-900 dark:text-white">Not Applied</p>
              </div>
            </div>
          </div>

          {/* Family Contact */}
          {profile.profile.familyContact && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Emergency Contact
              </h3>
              <p className="text-gray-900 dark:text-white">{sanitize(profile.profile.familyContact)}</p>
            </div>
          )}
        </Card>
      )}

      {/* Instructor Information */}
      {user?.role === 'Instructor' && profile?.profile && (
        <Card title="Professional Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Position Details
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Instructor ID</p>
                <p className="text-gray-900 dark:text-white font-mono">{profile.profile.instructorId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Academic Rank</p>
                <Badge className={
                  profile.profile.degree === 'Professor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  profile.profile.degree === 'AssociateProfessor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  profile.profile.degree === 'AssistantProfessor' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  profile.profile.degree === 'Lecturer' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }>
                  {profile.profile.degree === 'AssociateProfessor' ? 'Associate Professor' :
                   profile.profile.degree === 'AssistantProfessor' ? 'Assistant Professor' :
                   profile.profile.degree || 'N/A'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Department
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Office</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.office || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/instructor/sections'}>
                  📚 My Sections
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/instructor/schedule'}>
                  📅 My Schedule
                </Button>
              </div>
            </div>
          </div>

          {/* Academic Rank Description */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Academic Ranks Reference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">TA</span>
                <p className="text-xs text-gray-500">Teaching Assistant</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">Lecturer</span>
                <p className="text-xs text-gray-500">Full-time Lecturer</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">Asst. Prof.</span>
                <p className="text-xs text-gray-500">Assistant Professor</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">Assoc. Prof.</span>
                <p className="text-xs text-gray-500">Associate Professor</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">Professor</span>
                <p className="text-xs text-gray-500">Full Professor</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* User with no specific role profile */}
      {user?.role && !['Admin', 'Student', 'Instructor'].includes(user.role) && (
        <Card title="Account Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <Badge className={getRoleColor(user?.role)}>
                {user?.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </Badge>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your account has limited access. Please contact an administrator if you need additional permissions.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
