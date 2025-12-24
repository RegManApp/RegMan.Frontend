import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getLoginSchema } from '../../utils/validators';
import { Button, Input } from '../common';

const LoginForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getLoginSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = (data) => {
    // Pass rememberMe flag along with credentials
    onSubmit({ ...data, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
          placeholder={t('authPages.placeholders.password')}
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

      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {t('authPages.actions.rememberMe')}
          </span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          {t('authPages.actions.forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        {t('authPages.actions.signIn')}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('authPages.login.noAccount')}{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          {t('authPages.actions.signUp')}
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
