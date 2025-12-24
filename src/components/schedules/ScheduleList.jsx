import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Table, Button, Badge, SearchInput, Select, Card, ConfirmModal, EmptyState } from '../common';
import { getDayOfWeekLabel } from '../../utils/constants';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const ScheduleList = ({
  schedules = [],
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  searchQuery = '',
  onSearchChange,
  dayFilter = '',
  onDayFilterChange,
  isAdmin = false,
}) => {
    const { t } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, schedule: null });

  const handleDelete = () => {
    if (deleteModal.schedule) {
      const id = deleteModal.schedule.scheduleSlotId ?? deleteModal.schedule.ScheduleSlotId ?? deleteModal.schedule.id;
      onDelete?.(id);
      setDeleteModal({ isOpen: false, schedule: null });
    }
  };

  const dayOptions = [
    { value: '', label: 'All Days' },
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  const getDayColor = (day) => {
    const colors = {
      0: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      2: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      3: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      4: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      5: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      6: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'course',
      header: 'Course',
      render: (_, schedule) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{schedule.sectionName || schedule.SectionName || schedule.courseName || ''}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{schedule.slotType || schedule.SlotType || ''}</p>
        </div>
      ),
    },
    {
      key: 'instructorName',
      header: 'Instructor',
      render: (_, schedule) => schedule.instructorName || schedule.InstructorName || '',
    },
    {
      key: 'dayOfWeek',
      header: 'Day',
      render: (_, schedule) => {
        // Backend returns TimeSlot string like "Monday 09:00-10:00"
        const timeSlotStr = schedule.timeSlot || schedule.TimeSlot || '';
        const dayLabel = timeSlotStr.split(' ')[0] || (schedule.dayOfWeek !== undefined ? getDayOfWeekLabel(schedule.dayOfWeek) : '');
        return (
          <Badge className={getDayColor(schedule.dayOfWeek ?? dayLabel)}>
            {dayLabel}
          </Badge>
        );
      },
    },
    {
      key: 'time',
      header: 'Time',
      render: (_, schedule) => {
        const timeSlotStr = schedule.timeSlot || schedule.TimeSlot || '';
        if (timeSlotStr) {
          // TimeSlot often contains both day and time like "Monday 09:00-10:00"
          return timeSlotStr.split(' ').slice(1).join(' ') || timeSlotStr;
        }
        return `${schedule.startTime || ''}${schedule.startTime && schedule.endTime ? ' - ' : ''}${schedule.endTime || ''}`;
      },
    },
    {
      key: 'roomNumber',
      header: 'Room',
      render: (_, schedule) => schedule.room || schedule.Room || schedule.roomNumber || '',
    },
    {
      key: 'semester',
      header: 'Semester',
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (_, schedule) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={PencilIcon}
            onClick={() => onEdit?.(schedule)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={TrashIcon}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={() => setDeleteModal({ isOpen: true, schedule })}
          >
            Delete
          </Button>
        </div>
      ),
    });
  }

  if (!isLoading && schedules.length === 0 && !searchQuery && !dayFilter) {
    return (
      <Card>
        <EmptyState
          title="No schedules yet"
          description={isAdmin ? "Get started by adding class schedules." : "No scheduled classes found."}
          action={
            isAdmin && (
              <Button icon={PlusIcon} onClick={onCreate}>
                Add Schedule
              </Button>
            )
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              onClear={() => onSearchChange?.('')}
              placeholder="Search schedules..."
              className="w-full sm:w-64"
            />
            <Select
              value={dayFilter}
              onChange={(e) => onDayFilterChange?.(e.target.value)}
              options={dayOptions}
              className="w-full sm:w-40"
            />
          </div>
          {isAdmin && (
            <Button icon={PlusIcon} onClick={onCreate}>
              Add Schedule
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          data={schedules}
          isLoading={isLoading}
          emptyMessage="No schedules found."
        />
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, schedule: null })}
        onConfirm={handleDelete}
        title={t('schedules.confirmDeleteTitle')}
        message={t('schedules.confirmDeleteMessage', {
          name:
            deleteModal.schedule?.courseName ||
            deleteModal.schedule?.SectionName ||
            t('schedules.confirmDeleteNameFallback'),
        })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </>
  );
};

export default ScheduleList;
