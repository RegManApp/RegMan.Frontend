import { Link } from 'react-router-dom';
import { BookOpenIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';
import { Card, Button, Badge } from '../common';
import { useState } from 'react';
import { toast } from 'react-toastify';
import cartApi from '../../api/cartApi';
import adminApi from '../../api/adminApi';

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
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await cartApi.addToCartByCourse(course.id);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
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
      await cartApi.dropCourse(course.id);
      toast.success('Course dropped');
      if (onDrop) onDrop(course.id);
    } catch (error) {
      toast.error('Failed to drop course');
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
        {course.description || <span className="italic text-gray-400">No description</span>}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <BookOpenIcon className="w-4 h-4" />
          <span>{course.creditHours} Credits</span>
        </div>
        {course.enrollmentCount !== undefined && (
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{course.enrollmentCount} Enrolled</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link to={`/courses/${course.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        {isAdmin ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(course)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete?.(course.id)}
            >
              Delete
            </Button>
          </>
        ) : cartStatus === 'added' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleRemoveFromCart}
          >
            Remove from Cart
          </Button>
        ) : enrollmentStatus === 'approved' && registrationEndDate && new Date() < new Date(registrationEndDate) ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDrop}
            disabled={isDropping}
          >
            {isDropping ? 'Dropping...' : 'Drop'}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
