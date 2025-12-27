import { cn } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

const Tabs = ({ tabs, activeTab, onChange, className }) => {
  const { t } = useTranslation();

  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <nav className="-mb-px flex space-x-8" aria-label={t('a11y.tabs')}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <tab.icon className="h-5 w-5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
