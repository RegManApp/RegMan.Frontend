import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../hooks/useDirection';

const Breadcrumb = ({ items = [], className }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  // Auto-generate breadcrumbs from path if no items provided
  const breadcrumbs = items.length > 0 ? items : location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + arr.slice(0, index + 1).join('/'),
      current: index === arr.length - 1,
    }));

  return (
    <nav className={cn('flex', className)} aria-label={t('a11y.breadcrumb')}>
      <ol className={cn('flex items-center space-x-2', isRtl && 'space-x-reverse')}>
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <HomeIcon className="h-5 w-5 flex-shrink-0" />
            <span className="sr-only">{t('common.home')}</span>
          </Link>
        </li>
        {breadcrumbs.map((item) => (
          <li key={item.href} className="flex items-center">
            <ChevronRightIcon className={cn('h-5 w-5 flex-shrink-0 text-gray-400', isRtl && 'rtl-flip')} />
            {item.current ? (
              <span className={cn('text-sm font-medium text-gray-500 dark:text-gray-400', isRtl ? 'mr-2' : 'ml-2')}>
                {item.labelKey ? t(item.labelKey) : item.name}
              </span>
            ) : (
              <Link
                to={item.href}
                className={cn(
                  'text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  isRtl ? 'mr-2' : 'ml-2'
                )}
              >
                {item.labelKey ? t(item.labelKey) : item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
