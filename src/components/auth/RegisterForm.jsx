import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { registerSchema } from '../../utils/validators';
import { Button, Input, Select } from '../common';

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
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
          label="First Name"
          placeholder="Enter your first name"
          icon={UserIcon}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Enter your last name"
          icon={UserIcon}
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        icon={EnvelopeIcon}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          icon={LockClosedIcon}
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          className="absolute right-3 top-8 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirm your password"
        icon={LockClosedIcon}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Select
        label="Role"
        error={errors.role?.message}
        options={[
          { value: 'Student', label: 'Student' },
          { value: 'Admin', label: 'Admin' },
        ]}
        {...register('role')}
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

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
