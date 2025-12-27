import { useTranslation } from 'react-i18next';
import { Card, Avatar, Badge, Button, Table } from '../common';
import { getFullName } from '../../utils/helpers';
import { getDayOfWeekLabel, getInstructorDegreeLabel } from '../../utils/constants';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const InstructorDetails = ({
  instructor,
  schedules = [],
  onEdit,
  onBack,
  isLoadingSchedules = false,
}) => {
  const { t } = useTranslation();
  if (!instructor) return null;

  // Get name parts from fullName
  const nameParts = (instructor.fullName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const scheduleColumns = [
    {
      key: 'courseName',
      header: t('instructors.details.schedule.table.course'),
      render: (_, schedule) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{schedule.sectionName || schedule.courseName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{schedule.courseCode}</p>
        </div>
      ),
    },
    {
      key: 'dayOfWeek',
      header: t('common.day'),
      render: (value, schedule) => getDayOfWeekLabel(value) || schedule.timeSlot?.split(' ')[0] || t('common.notAvailable'),
    },
    {
      key: 'time',
      header: t('common.time'),
      render: (_, schedule) => {
        if (schedule.timeSlot) {
          const parts = schedule.timeSlot.split(' ');
          return parts.slice(1).join(' ') || schedule.timeSlot;
        }
        return schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : t('common.notAvailable');
      },
    },
    {
      key: 'room',
      header: t('common.room'),
      render: (_, schedule) => schedule.room || schedule.roomNumber || t('common.notAvailable'),
    },
    {
      key: 'slotType',
      header: t('common.type'),
      render: (value) => value || t('common.notAvailable'),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={firstName}
              lastName={lastName}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {instructor.title ? `${instructor.title} ` : ''}{instructor.fullName || getFullName(firstName, lastName)}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {instructor.email}
              </p>
              <div className="flex gap-2 mt-2">
                {instructor.degree !== undefined && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {getInstructorDegreeLabel(instructor.degree) || instructor.degreeDisplay}
                  </Badge>
                )}
                {instructor.department && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {instructor.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeftIcon} onClick={onBack}>
              {t('common.back')}
            </Button>
            <Button icon={PencilIcon} onClick={() => onEdit?.(instructor)}>
              {t('common.edit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.email')}</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('instructors.details.fields.title')}</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.title || t('common.notAvailable')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('instructors.details.fields.academicDegree')}</h4>
            <p className="mt-1 text-gray-900 dark:text-white">
              {getInstructorDegreeLabel(instructor.degree) || instructor.degreeDisplay || t('common.notAvailable')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('instructors.details.fields.department')}</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.department || t('common.notAvailable')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('instructors.details.fields.address')}</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.address || t('common.notAvailable')}</p>
          </div>
        </div>
      </Card>

      <Card title={t('instructors.details.schedule.title')}>
        <Table
          columns={scheduleColumns}
          data={schedules}
          isLoading={isLoadingSchedules}
          emptyMessage={t('instructors.details.schedule.empty')}
        />
      </Card>
    </div>
  );
};

export default InstructorDetails;
