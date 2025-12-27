import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Avatar, Button } from '../common';
import { getFullName, getStudentLevelColor, formatDate } from '../../utils/helpers';

const StudentCard = ({ student, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const getStudentLevelKey = (value) => {
    if (typeof value === 'number') {
      if (value === 0) return 'freshman';
      if (value === 1) return 'sophomore';
      if (value === 2) return 'junior';
      if (value === 3) return 'senior';
      return null;
    }
    const v = String(value || '').toLowerCase();
    if (v.includes('fresh')) return 'freshman';
    if (v.includes('soph')) return 'sophomore';
    if (v.includes('jun')) return 'junior';
    if (v.includes('sen')) return 'senior';
    return null;
  };

  const renderStudentLevel = (value) => {
    const key = getStudentLevelKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.studentLevel.${key}`);
  };

  return (
    <Card hover className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={student.user?.firstName}
              lastName={student.user?.lastName}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {getFullName(student.user?.firstName, student.user?.lastName)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {student.studentNumber}
              </p>
            </div>
          </div>
          <Badge className={getStudentLevelColor(student.studentLevel)}>
            {renderStudentLevel(student.studentLevel)}
          </Badge>
        </div>

        <div className="space-y-2 flex-grow">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('common.email')}: </span>
            <span className="text-gray-900 dark:text-white">
              {student.user?.email}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('students.fields.enrolled')}: </span>
            <span className="text-gray-900 dark:text-white">
              {formatDate(student.enrollmentDate)}
            </span>
          </div>
          {student.city && (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.city')}: </span>
              <span className="text-gray-900 dark:text-white">
                {student.city}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link to={`/students/${student.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              {t('common.viewDetails')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(student)}
          >
            {t('common.edit')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;
