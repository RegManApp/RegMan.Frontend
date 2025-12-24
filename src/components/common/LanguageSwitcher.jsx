import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/helpers';

const LanguageSwitcher = ({ className }) => {
  const { i18n, t } = useTranslation();

  const current = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';

  const setLanguage = async (lng) => {
    if (lng === current) return;
    await i18n.changeLanguage(lng);
  };

  return (
    <div className={cn('inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2.5 py-1 text-xs font-semibold',
          current === 'en'
            ? 'bg-primary-600 text-white'
            : 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
        aria-label={t('common.english')}
      >
        {t('common.english')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={cn(
          'px-2.5 py-1 text-xs font-semibold',
          current === 'ar'
            ? 'bg-primary-600 text-white'
            : 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
        aria-label={t('common.arabic')}
      >
        {t('common.arabic')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
