import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const { user, updateUser, isStudent } = useAuth();
  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';
  const number2 = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  const getUserRoleKey = (value) => {
    const v = String(value || '');
    if (v === 'Admin') return 'admin';
    if (v === 'Student') return 'student';
    if (v === 'Instructor') return 'instructor';
    return null;
  };

  const renderUserRole = (value) => {
    const key = getUserRoleKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.userRole.${key}`);
  };

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
      const payload = {
        ...data,
        FullName: `${data.firstName} ${data.lastName}`,
        StudentId: profile?.profile?.studentId || profile?.studentId || user?.studentId || 0,
      };
      await authApi.updateStudentProfile(payload);
      updateUser(payload);
      toast.success(t('profile.toasts.updated'));
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsPasswordLoading(true);
    try {
      if (isStudent?.()) {
        await authApi.changeStudentPassword({
          email: user?.email || '',
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmNewPassword,
        });
      } else {
        await authApi.changePassword(data);
      }
      toast.success(t('profile.toasts.passwordChanged'));
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ labelKey: 'nav.profile', href: '/profile', current: true }]} />
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('nav.profile')}
        </h1>
      </div>

      {/* Profile Card */}
      <Card title={t('profile.cards.personalInformation')}>
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
                  label={t('profile.fields.firstName')}
                  error={profileErrors.firstName?.message}
                  {...registerProfile('firstName')}
                />
                <Input
                  label={t('profile.fields.lastName')}
                  error={profileErrors.lastName?.message}
                  {...registerProfile('lastName')}
                />
              </div>
              <Input
                label={t('common.email')}
                type="email"
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />
              <div className="flex gap-3">
                <Button type="submit" loading={isProfileLoading}>
                  {t('common.save')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    resetProfile();
                  }}
                  disabled={isProfileLoading}
                >
                  {t('common.cancel')}
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
                  {renderUserRole(user?.role) || t('common.notAvailable')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.email')}</p>
                  <p className="text-gray-900 dark:text-white">{sanitize(user?.email)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.fields.memberSince')}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => setIsEditingProfile(true)}>
                  {t('profile.actions.editProfile')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title={t('profile.cards.security')}>
        {isChangingPassword ? (
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="max-w-md space-y-4"
          >
            <Input
              label={t('profile.security.fields.currentPassword')}
              type="password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <Input
              label={t('profile.security.fields.newPassword')}
              type="password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <Input
              label={t('profile.security.fields.confirmNewPassword')}
              type="password"
              error={passwordErrors.confirmNewPassword?.message}
              {...registerPassword('confirmNewPassword')}
            />

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('authPages.passwordRules.title')}
              <ul className="mt-1 list-disc list-inside">
                <li>{t('authPages.passwordRules.minLength')}</li>
                <li>{t('authPages.passwordRules.uppercase')}</li>
                <li>{t('authPages.passwordRules.lowercase')}</li>
                <li>{t('authPages.passwordRules.number')}</li>
                <li>{t('authPages.passwordRules.special')}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={isPasswordLoading}>
                {t('profile.actions.changePassword')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  resetPassword();
                }}
                disabled={isPasswordLoading}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('profile.security.description')}
            </p>
            <Button onClick={() => setIsChangingPassword(true)}>
              {t('profile.actions.changePassword')}
            </Button>
          </div>
        )}
      </Card>

      {/* Admin Information */}
      {user?.role === 'Admin' && (
        <Card title={t('profile.admin.title')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.admin.sections.details')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.fields.role')}</p>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {t('profile.admin.role.systemAdministrator')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.admin.fields.accessLevel')}</p>
                <p className="text-gray-900 dark:text-white">{t('profile.admin.access.full')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.fields.accountStatus')}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('profile.status.active')}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.admin.sections.permissions')}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">{t('profile.admin.permissions.userManagement')}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{t('profile.admin.permissions.courseManagement')}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{t('profile.admin.permissions.enrollmentControl')}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{t('profile.admin.permissions.systemSettings')}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{t('profile.admin.permissions.reportsAndAnalytics')}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.common.quickActions')}
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/users'}>
                  {t('profile.admin.quickActions.manageUsers')}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/courses'}>
                  {t('profile.admin.quickActions.manageCourses')}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/admin/enrollments'}>
                  {t('profile.admin.quickActions.viewEnrollments')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Academic Information (for Students) */}
      {user?.role === 'Student' && profile?.profile && (
        <Card title={t('profile.student.title')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.student.sections.programInformation')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.studentId')}</p>
                <p className="text-gray-900 dark:text-white font-mono">{profile.profile.studentId || t('common.notAvailable')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.program')}</p>
                <p className="text-gray-900 dark:text-white">{t('profile.student.values.programUndergraduate')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.degree')}</p>
                <p className="text-gray-900 dark:text-white">{t('profile.student.values.degreeBachelorOfScience')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.curriculum')}</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.academicPlan?.academicPlanName || t('common.notAssigned')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.college')}</p>
                <p className="text-gray-900 dark:text-white">{t('profile.student.values.collegeInformationTechnology')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.department')}</p>
                <p className="text-gray-900 dark:text-white">{t('profile.student.values.departmentComputerScience')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.student.sections.academicProgress')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.completedCredits')}</p>
                <p className="text-gray-900 dark:text-white font-semibold">{profile.profile.completedCredits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.registeredCredits')}</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.registeredCredits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.totalRequiredCredits')}</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.academicPlan?.totalCreditHours || t('common.notAvailable')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.progress')}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((profile.profile.completedCredits || 0) / (profile.profile.academicPlan?.totalCreditHours || 120)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('profile.student.progressComplete', {
                    percent: Math.round(((profile.profile.completedCredits || 0) / (profile.profile.academicPlan?.totalCreditHours || 120)) * 100),
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.termCreditLimit')}</p>
                <p className="text-gray-900 dark:text-white">{number2.format(21)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.student.sections.gpaAndStatus')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('gpa.currentGpa')}</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {number2.format(profile.profile.gpa ?? 0)}
                </p>
                <p className="text-xs text-gray-500">{t('profile.student.gpaOutOf', { max: number2.format(4) })}</p>
              </div>
              {/* GPA What-If Calculator */}
              <div id="gpa-whatif" className="mt-4">
                <GpaWhatIf currentGpaFromProfile={profile.profile.gpa} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.academicStanding')}</p>
                <Badge className={
                  profile.profile.gpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  profile.profile.gpa >= 2.0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }>
                  {profile.profile.gpa >= 3.5
                    ? t('profile.student.standing.deansList')
                    : profile.profile.gpa >= 2.0
                      ? t('profile.student.standing.goodStanding')
                      : t('profile.student.standing.academicProbation')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.classification')}</p>
                <p className="text-gray-900 dark:text-white">
                  {profile.profile.completedCredits >= 90
                    ? t('enums.studentLevel.senior')
                    : profile.profile.completedCredits >= 60
                      ? t('enums.studentLevel.junior')
                      : profile.profile.completedCredits >= 30
                        ? t('enums.studentLevel.sophomore')
                        : t('enums.studentLevel.freshman')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.student.fields.graduationStatus')}</p>
                <p className="text-gray-900 dark:text-white">{t('common.notApplied')}</p>
              </div>
            </div>
          </div>

          {/* Family Contact */}
          {profile.profile.familyContact && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('profile.student.sections.emergencyContact')}
              </h3>
              <p className="text-gray-900 dark:text-white">{sanitize(profile.profile.familyContact)}</p>
            </div>
          )}
        </Card>
      )}

      {/* Instructor Information */}
      {user?.role === 'Instructor' && profile?.profile && (
        <Card title={t('profile.instructor.title')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.instructor.sections.positionDetails')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.instructor.fields.instructorId')}</p>
                <p className="text-gray-900 dark:text-white font-mono">{profile.profile.instructorId || t('common.notAvailable')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.instructor.fields.title')}</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.title || t('common.notAvailable')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.instructor.fields.academicRank')}</p>
                <Badge className={
                  profile.profile.degree === 'Professor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  profile.profile.degree === 'AssociateProfessor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  profile.profile.degree === 'AssistantProfessor' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  profile.profile.degree === 'Lecturer' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }>
                  {profile.profile.degree === 'AssociateProfessor'
                    ? t('enums.instructorDegree.associateProfessor')
                    : profile.profile.degree === 'AssistantProfessor'
                      ? t('enums.instructorDegree.assistantProfessor')
                      : profile.profile.degree === 'Professor'
                        ? t('enums.instructorDegree.professor')
                        : profile.profile.degree === 'Lecturer'
                          ? t('enums.instructorDegree.lecturer')
                          : profile.profile.degree || t('common.notAvailable')}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.instructor.sections.department')}
              </h3>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.instructor.fields.department')}</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.department || t('common.notAvailable')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.instructor.fields.office')}</p>
                <p className="text-gray-900 dark:text-white">{profile.profile.office || t('common.notAssigned')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.fields.status')}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('profile.status.active')}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                {t('profile.common.quickActions')}
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/instructor/sections'}>
                  {t('profile.instructor.quickActions.mySections')}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/instructor/schedule'}>
                  {t('profile.instructor.quickActions.mySchedule')}
                </Button>
              </div>
            </div>
          </div>

          {/* Academic Rank Description */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('profile.instructor.sections.ranksReference')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">{t('profile.instructor.ranks.ta.label')}</span>
                <p className="text-xs text-gray-500">{t('profile.instructor.ranks.ta.description')}</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">{t('profile.instructor.ranks.lecturer.label')}</span>
                <p className="text-xs text-gray-500">{t('profile.instructor.ranks.lecturer.description')}</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">{t('profile.instructor.ranks.assistantProfessor.label')}</span>
                <p className="text-xs text-gray-500">{t('profile.instructor.ranks.assistantProfessor.description')}</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">{t('profile.instructor.ranks.associateProfessor.label')}</span>
                <p className="text-xs text-gray-500">{t('profile.instructor.ranks.associateProfessor.description')}</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <span className="font-medium">{t('profile.instructor.ranks.professor.label')}</span>
                <p className="text-xs text-gray-500">{t('profile.instructor.ranks.professor.description')}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* User with no specific role profile */}
      {user?.role && !['Admin', 'Student', 'Instructor'].includes(user.role) && (
        <Card title={t('profile.other.title')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.fields.role')}</p>
              <Badge className={getRoleColor(user?.role)}>
                {renderUserRole(user?.role)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.fields.accountStatus')}</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {t('profile.status.active')}
              </Badge>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('profile.other.limitedAccessMessage')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
