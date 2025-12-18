import { cn } from '../../utils/helpers';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className,
  iconClassName,
}) => {
  const isPositiveTrend = trend > 0;
  const isNegativeTrend = trend < 0;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center">
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositiveTrend && 'text-green-600 dark:text-green-400',
                  isNegativeTrend && 'text-red-600 dark:text-red-400',
                  !isPositiveTrend && !isNegativeTrend && 'text-gray-500'
                )}
              >
                {isPositiveTrend && '+'}
                {trend}%
              </span>
              {trendLabel && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3 rounded-lg',
              iconClassName || 'bg-primary-100 dark:bg-primary-900/30'
            )}
          >
            <Icon
              className={cn(
                'w-6 h-6',
                iconClassName
                  ? 'text-current'
                  : 'text-primary-600 dark:text-primary-400'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
