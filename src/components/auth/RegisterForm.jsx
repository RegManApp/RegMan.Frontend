import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getRegisterSchema } from '../../utils/validators';
import { Button, Input } from '../common';

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getRegisterSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Student',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('authPages.fields.firstName')}
          placeholder={t('authPages.placeholders.firstName')}
          icon={UserIcon}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label={t('authPages.fields.lastName')}
          placeholder={t('authPages.placeholders.lastName')}
          icon={UserIcon}
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label={t('authPages.fields.email')}
        type="email"
        placeholder={t('authPages.placeholders.email')}
        icon={EnvelopeIcon}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="relative">
        <Input
          label={t('authPages.fields.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('authPages.placeholders.createPassword')}
          icon={LockClosedIcon}
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? t('authPages.actions.hide') : t('authPages.actions.show')}
        </button>
      </div>

      <Input
        label={t('authPages.fields.confirmPassword')}
        type={showPassword ? 'text' : 'password'}
        placeholder={t('authPages.placeholders.confirmPassword')}
        icon={LockClosedIcon}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {/* Role is always Student for public registration - hidden from form */}
      <input type="hidden" value="Student" {...register('role')} />

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

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        {t('authPages.actions.createAccount')}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('authPages.register.haveAccount')}{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {t('authPages.actions.signIn')}
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
