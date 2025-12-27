import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Modal, Select, Button } from '../common';

// SlotType enum matching backend
const SLOT_TYPES = [
  { value: '0', key: 'lecture' },
  { value: '1', key: 'lab' },
  { value: '2', key: 'tutorial' },
];

const ScheduleForm = ({
  isOpen,
  onClose,
  onSubmit,
  schedule = null,
  sections = [],
  rooms = [],
  timeSlots = [],
  instructors = [],
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const isEditing = Boolean(schedule?.scheduleSlotId || schedule?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sectionId: '',
      roomId: '',
      timeSlotId: '',
      instructorId: '',
      slotType: '0',
    },
  });

  useEffect(() => {
    if (schedule && (schedule.scheduleSlotId || schedule.id)) {
      reset({
        sectionId: (schedule.sectionId || '')?.toString(),
        roomId: (schedule.roomId || '')?.toString(),
        timeSlotId: (schedule.timeSlotId || '')?.toString(),
        instructorId: (schedule.instructorId || '')?.toString(),
        slotType: (schedule.slotType ?? 0)?.toString(),
      });
    } else {
      reset({
        sectionId: '',
        roomId: '',
        timeSlotId: '',
        instructorId: '',
        slotType: '0',
      });
    }
  }, [schedule, reset]);

  const handleFormSubmit = (data) => {
    const sectionIdNum = Number(data.sectionId);
    const roomIdNum = Number(data.roomId);
    const timeSlotIdNum = Number(data.timeSlotId);
    const instructorIdNum = Number(data.instructorId);
    const slotTypeNum = Number(data.slotType);

    // Validate all required fields
    if (isNaN(sectionIdNum) || sectionIdNum <= 0) {
      return;
    }
    if (isNaN(roomIdNum) || roomIdNum <= 0) {
      return;
    }
    if (isNaN(timeSlotIdNum) || timeSlotIdNum <= 0) {
      return;
    }
    if (isNaN(instructorIdNum) || instructorIdNum <= 0) {
      return;
    }

    const submitData = {
      sectionId: sectionIdNum,
      roomId: roomIdNum,
      timeSlotId: timeSlotIdNum,
      instructorId: instructorIdNum,
      slotType: slotTypeNum,
    };
    onSubmit(submitData);
  };

  // Helper to format day name
  const getDayName = (dayNum) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const key = dayKeys[dayNum];
    return key ? t(`common.days.${key}`) : t('common.notAvailable');
  };

  // Helper to format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
    return timeStr;
  };

  const sectionOptions = [
    { value: '', label: t('schedules.form.placeholders.selectSection') },
    ...sections.map((section) => {
      const sectionId = section.sectionId || section.id;
      const courseName = section.courseSummary?.courseName || section.courseName || section.course?.courseName || t('common.notAvailable');
      const courseCode = section.courseSummary?.courseCode || section.courseCode || '';
      const sectionName = section.sectionName || `Section ${sectionId}`;
      return {
        value: sectionId?.toString() || '',
        label: `${courseCode ? courseCode + ' - ' : ''}${courseName} - ${sectionName} (${section.semester || ''})`,
      };
    }),
  ];

  const roomOptions = [
    { value: '', label: t('schedules.form.placeholders.selectRoom') },
    ...rooms.map((room) => ({
      value: (room.roomId || room.id)?.toString() || '',
      label: `${room.building || ''} ${room.roomNumber || ''} (Cap: ${room.capacity || 0})`,
    })),
  ];

  const timeSlotOptions = [
    { value: '', label: t('schedules.form.placeholders.selectTimeSlot') },
    ...timeSlots.map((slot) => ({
      value: (slot.timeSlotId || slot.id)?.toString() || '',
      label: `${getDayName(slot.day)} ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
    })),
  ];

  const instructorOptions = [
    { value: '', label: t('schedules.form.placeholders.selectInstructor') },
    ...instructors.map((instructor) => ({
      value: (instructor.instructorId || instructor.id)?.toString() || '',
      label: instructor.fullName || `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || t('common.notAvailable'),
    })),
  ];

  const slotTypeOptions = SLOT_TYPES.map((slotType) => ({
    value: slotType.value,
    label: t(`sections.slotTypes.${slotType.key}`),
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('schedules.form.editTitle') : t('schedules.form.createTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label={t('schedules.form.fields.section')}
          options={sectionOptions}
          error={errors.sectionId?.message}
          {...register('sectionId', { required: t('schedules.form.validation.sectionRequired') })}
        />

        <Select
          label={t('schedules.form.fields.instructor')}
          options={instructorOptions}
          error={errors.instructorId?.message}
          {...register('instructorId', { required: t('schedules.form.validation.instructorRequired') })}
        />

        <Select
          label={t('schedules.form.fields.room')}
          options={roomOptions}
          error={errors.roomId?.message}
          {...register('roomId', { required: t('schedules.form.validation.roomRequired') })}
        />

        <Select
          label={t('schedules.form.fields.timeSlot')}
          options={timeSlotOptions}
          error={errors.timeSlotId?.message}
          {...register('timeSlotId', { required: t('schedules.form.validation.timeSlotRequired') })}
        />

        <Select
          label={t('schedules.form.fields.slotType')}
          options={slotTypeOptions}
          error={errors.slotType?.message}
          {...register('slotType')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? t('schedules.form.actions.updateSchedule') : t('schedules.form.actions.createSchedule')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleForm;
