import { Card, Avatar, Badge, Button, Table } from '../common';
import { getFullName } from '../../utils/helpers';
import { getDayOfWeekLabel, getInstructorDegreeLabel } from '../../utils/constants';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const InstructorDetails = ({
  instructor,
  onEdit,
  onBack,
}) => {
  if (!instructor) return null;

  // Get name parts from fullName
  const nameParts = (instructor.fullName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const scheduleColumns = [
    {
      key: 'courseName',
      header: 'Course',
      render: (_, schedule) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{schedule.sectionName || schedule.courseName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{schedule.courseCode}</p>
        </div>
      ),
    },
    {
      key: 'dayOfWeek',
      header: 'Day',
      render: (value, schedule) => schedule.timeSlot?.split(' ')[0] || getDayOfWeekLabel(value) || '-',
    },
    {
      key: 'time',
      header: 'Time',
      render: (_, schedule) => {
        if (schedule.timeSlot) {
          const parts = schedule.timeSlot.split(' ');
          return parts.slice(1).join(' ') || schedule.timeSlot;
        }
        return schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : '-';
      },
    },
    {
      key: 'room',
      header: 'Room',
      render: (_, schedule) => schedule.room || schedule.roomNumber || '-',
    },
    {
      key: 'slotType',
      header: 'Type',
      render: (value) => value || '-',
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
              Back
            </Button>
            <Button icon={PencilIcon} onClick={() => onEdit?.(instructor)}>
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.title || '-'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Degree</h4>
            <p className="mt-1 text-gray-900 dark:text-white">
              {getInstructorDegreeLabel(instructor.degree) || instructor.degreeDisplay || '-'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.department || '-'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h4>
            <p className="mt-1 text-gray-900 dark:text-white">{instructor.address || '-'}</p>
          </div>
        </div>
      </Card>

      {instructor.schedules && instructor.schedules.length > 0 && (
        <Card title="Teaching Schedule">
          <Table
            columns={scheduleColumns}
            data={instructor.schedules}
            emptyMessage="No scheduled classes."
          />
        </Card>
      )}
    </div>
  );
};

export default InstructorDetails;
