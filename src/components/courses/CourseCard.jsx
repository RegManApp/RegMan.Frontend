import { Link } from 'react-router-dom';
import { BookOpenIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';
import { Card, Button, Badge } from '../common';
import { useState } from 'react';
import toast from 'react-hot-toast';
import cartApi from '../../api/cartApi';
import { formatDate } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

const CourseCard = ({
  course,
  cartStatus,
  enrollmentStatus,
  registrationEndDate,
  onEdit,
  onDelete,
  isAdmin,
  isEnrolled,
  onRemoveFromCart,
  onDrop,
  onAddToCart,
}) => {
  const { t, i18n } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const now = new Date();
  const end = registrationEndDate ? new Date(registrationEndDate) : null;
  const isRegistrationOpen = !end || now < end;
  const isStatusEnrolled = enrollmentStatus === 1 || enrollmentStatus === 'Enrolled';
  const isStatusPending = enrollmentStatus === 0 || enrollmentStatus === 'Pending';
  const canDrop = isRegistrationOpen && (isStatusEnrolled || isStatusPending);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await cartApi.addToCartByCourse(course.id);
      toast.success(t('courses.toasts.addedToCart'));
      await onAddToCart?.(course.id);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error(t('courses.errors.alreadyInCart'));
      } else if (status === 404) {
        toast.error(t('courses.errors.courseNotFound'));
      } else {
        const serverMessage = error?.response?.data?.message;
        const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar');
        toast.error(!isArabic && serverMessage ? serverMessage : t('courses.errors.addToCartFailed'));
      }
    } finally {
      setIsAdding(false);
    }
  };
  const handleRemoveFromCart = async () => {
    if (onRemoveFromCart) onRemoveFromCart(course.id);
  };
  const handleDrop = async () => {
    setIsDropping(true);
    try {
      await onDrop?.(course.id);
    } catch (error) {
      toast.error(t('courses.errors.dropFailed'));
    } finally {
      setIsDropping(false);
    }
  };

  return (
    <Card hover className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="primary" size="sm">
          {course.courseCode}
        </Badge>
        {course.categoryName && (
          <Badge variant="secondary" size="sm">
            {course.categoryName}
          </Badge>
        )}
      </div>

      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
        {course.courseName}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
        {course.description || <span className="italic text-gray-400">{t('courses.noDescription')}</span>}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <BookOpenIcon className="w-4 h-4" />
          <span>{t('courses.creditsWithValue', { count: course.creditHours })}</span>
        </div>
        {course.enrollmentCount !== undefined && (
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{t('courses.enrolledWithValue', { count: course.enrollmentCount })}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link to={`/courses/${course.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            {t('courses.viewDetails')}
          </Button>
        </Link>
        {isAdmin ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(course)}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete?.(course.id)}
            >
              {t('common.delete')}
            </Button>
          </>
        ) : cartStatus === 'added' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleRemoveFromCart}
          >
            {t('courses.removeFromCart')}
          </Button>
        ) : (isStatusEnrolled || isStatusPending) ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDrop}
            disabled={isDropping || !canDrop}
          >
            {isDropping ? t('courses.dropping') : t('courses.drop')}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding || !isRegistrationOpen}
          >
            {isAdding ? t('courses.adding') : t('courses.addToCart')}
          </Button>
        )}
      </div>

      {!isAdmin && registrationEndDate && !isRegistrationOpen && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {t('courses.registrationClosedNotice', { date: formatDate(registrationEndDate) })}
        </p>
      )}
    </Card>
  );
};

export default CourseCard;
