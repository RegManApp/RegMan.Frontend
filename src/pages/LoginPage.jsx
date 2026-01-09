import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useDirection } from '../hooks/useDirection';
import { cn } from '../utils/helpers';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  const searchParams = new URLSearchParams(location.search);
  const fromQuery = searchParams.get('from');
  const fromStateLocation = location.state?.from;
  const fromState =
    fromStateLocation &&
    typeof fromStateLocation === 'object' &&
    typeof fromStateLocation.pathname === 'string'
      ? `${fromStateLocation.pathname || ''}${fromStateLocation.search || ''}${fromStateLocation.hash || ''}`
      : null;
  const isSafeInternalPath = (value) =>
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
  const from =
    (isSafeInternalPath(fromState) && fromState) ||
    (isSafeInternalPath(fromQuery) && fromQuery) ||
    '/dashboard';

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className={cn('absolute top-4', isRtl ? 'left-4' : 'right-4')}>
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {t('app.name')}
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            {t('authPages.login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('authPages.login.subtitle')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
