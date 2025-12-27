import { Link } from 'react-router-dom';
import { Button } from '../components/common';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
          404
        </h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          {t('notFound.title')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('notFound.description')}
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>{t('notFound.goHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
