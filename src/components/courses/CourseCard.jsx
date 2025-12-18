import { Link } from 'react-router-dom';
import { BookOpenIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';
import { Card, Button, Badge } from '../common';

const CourseCard = ({
  course,
  onEdit,
  onEnroll,
  onUnenroll,
  isAdmin,
  isEnrolled,
}) => {
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

      {course.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>
      )}

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(course)}
          >
            Edit
          </Button>
        ) : isEnrolled ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onUnenroll?.(course.id)}
          >
            Drop
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEnroll?.(course.id)}
          >
            Enroll
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
