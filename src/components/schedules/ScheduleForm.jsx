import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal, Input, Select, Button } from '../common';
import { scheduleSchema } from '../../utils/validators';
import { DAYS_OF_WEEK, SEMESTERS } from '../../utils/constants';

const ScheduleForm = ({
  isOpen,
  onClose,
  onSubmit,
  schedule = null,
  courses = [],
  instructors = [],
  isLoading = false,
}) => {
  const isEditing = Boolean(schedule?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      courseId: '',
      instructorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      roomNumber: '',
      semester: '',
    },
  });

  useEffect(() => {
    if (schedule) {
      reset({
        courseId: schedule.courseId || '',
        instructorId: schedule.instructorId || '',
        dayOfWeek: schedule.dayOfWeek?.toString() || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        roomNumber: schedule.roomNumber || '',
        semester: schedule.semester || '',
      });
    } else {
      reset({
        courseId: '',
        instructorId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        roomNumber: '',
        semester: SEMESTERS[0] || '',
      });
    }
  }, [schedule, reset]);

  const handleFormSubmit = (data) => {
    const submitData = {
      ...data,
      courseId: Number(data.courseId),
      instructorId: Number(data.instructorId),
      dayOfWeek: Number(data.dayOfWeek),
    };
    onSubmit(submitData);
  };

  const courseOptions = [
    { value: '', label: 'Select Course' },
    ...courses.map((course) => ({
      value: course.id,
      label: `${course.courseCode} - ${course.courseName}`,
    })),
  ];

  const instructorOptions = [
    { value: '', label: 'Select Instructor' },
    ...instructors.map((instructor) => ({
      value: instructor.id,
      label: instructor.fullName || `${instructor.firstName} ${instructor.lastName}`,
    })),
  ];

  const dayOptions = [
    { value: '', label: 'Select Day' },
    ...DAYS_OF_WEEK.map((day) => ({
      value: day.value.toString(),
      label: day.label,
    })),
  ];

  const semesterOptions = [
    { value: '', label: 'Select Semester' },
    ...SEMESTERS.map((sem) => ({
      value: sem,
      label: sem,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Schedule' : 'Add New Schedule'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Course"
          options={courseOptions}
          error={errors.courseId?.message}
          disabled={isEditing}
          {...register('courseId')}
        />

        <Select
          label="Instructor"
          options={instructorOptions}
          error={errors.instructorId?.message}
          {...register('instructorId')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Day of Week"
            options={dayOptions}
            error={errors.dayOfWeek?.message}
            {...register('dayOfWeek')}
          />
          <Select
            label="Semester"
            options={semesterOptions}
            error={errors.semester?.message}
            {...register('semester')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />
          <Input
            label="End Time"
            type="time"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        <Input
          label="Room Number"
          error={errors.roomNumber?.message}
          placeholder="e.g., Room 101"
          {...register('roomNumber')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleForm;
