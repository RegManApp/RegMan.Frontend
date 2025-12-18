import { useState } from 'react';
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
import { getFullName, getRoleColor, formatDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
                  {getFullName(user?.firstName, user?.lastName)}
                </h2>
                <Badge className={getRoleColor(user?.role)}>
                  {user?.role || 'User'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
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
    </div>
  );
};

export default ProfilePage;
