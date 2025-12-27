import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createEnrollmentSchema, updateEnrollmentSchema } from '../../utils/validators';
import { ENROLLMENT_STATUSES, GRADES, SEMESTERS } from '../../utils/constants';
import { Modal, Button, Select, Input } from '../common';
import { getFullName } from '../../utils/helpers';

const EnrollmentForm = ({
  isOpen,
  onClose,
  onSubmit,
  enrollment,
  students = [],
  sections = [],
  isLoading,
}) => {
  const { t } = useTranslation();
  const isEditing = !!enrollment?.enrollmentId || !!enrollment?.id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEditing ? updateEnrollmentSchema : createEnrollmentSchema),
    defaultValues: {
      studentUserId: '',
      sectionId: '',
      status: 0,
      grade: '',
    },
  });

  useEffect(() => {
    if (enrollment?.enrollmentId || enrollment?.id) {
      reset({
        status: enrollment.status ?? 0,
        grade: enrollment.grade || '',
      });
    } else {
      reset({
        studentUserId: '',
        sectionId: '',
        status: 0,
        grade: '',
      });
    }
  }, [enrollment, reset]);

  const handleFormSubmit = (data) => {
    if (isEditing) {
      onSubmit({
        grade: data.grade || null,
        status: Number(data.status),
      });
    } else {
      // Send studentUserId (string) and sectionId (number) for force-enroll
      onSubmit({
        studentUserId: data.studentUserId,
        sectionId: Number(data.sectionId),
      });
    }
  };

  // Student options using User.Id (string) as value
  const studentOptions = students.map((student) => {
    const name = student.fullName || student.user?.fullName || t('common.notAvailable');
    const studentNumber = student.studentProfile?.studentId || student.studentId || '';
    return {
      value: student.id, // User.Id (string GUID)
      label: `${studentNumber ? `#${studentNumber} - ` : ''}${name}`.trim(),
      search: `${studentNumber} ${name}`.toLowerCase(),
    };
  });

  // Custom filter for Select to allow searching by student number or name
  const filterStudentOption = (option, input) => {
    return option.data.search.includes(input.toLowerCase());
  };

  // Section options - show course name + section info
  // Backend returns sections with CourseSummary nested object
  const sectionOptions = sections.map((section) => {
    const courseName = section.courseSummary?.courseName || section.courseName || section.course?.courseName || '';
    const courseCode = section.courseSummary?.courseCode || section.courseCode || '';
    const sectionId = section.sectionId || section.id;
    const sectionName = section.sectionName || `Section ${sectionId}`;
    const semester = section.semester || '';
    const seats = section.availableSeats ?? 0;
    
    return {
      value: sectionId,
      label: `${courseCode ? `${courseCode} - ` : ''}${courseName} - ${sectionName} (${semester}) [${seats} seats]`,
    };
  });

  const statusOptions = ENROLLMENT_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  const gradeOptions = [
    { value: '', label: t('enrollments.form.noGrade') },
    ...GRADES.map((grade) => ({
      value: grade,
      label: grade,
    })),
  ];

  const watchStatus = watch('status');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('enrollments.form.editTitle') : t('enrollments.form.createTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {!isEditing && (
          <>
            <Select
              label={t('enrollments.form.fields.student')}
              placeholder={t('enrollments.form.placeholders.selectStudent')}
              options={studentOptions}
              error={errors.studentUserId?.message}
              filterOption={filterStudentOption}
              {...register('studentUserId')}
            />
            <Select
              label={t('enrollments.form.fields.section')}
              placeholder={t('enrollments.form.placeholders.selectSection')}
              options={sectionOptions}
              error={errors.sectionId?.message}
              {...register('sectionId')}
            />
          </>
        )}

        {isEditing && (
          <>
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('enrollments.form.summary.student')}: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getFullName(
                    enrollment?.student?.user?.firstName,
                    enrollment?.student?.user?.lastName
                  )}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('enrollments.form.summary.course')}: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {enrollment?.course?.courseName} ({enrollment?.course?.courseCode})
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('enrollments.form.summary.semester')}: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {enrollment?.semester || t('common.notAvailable')}
                </span>
              </p>
            </div>

            <Select
              label={t('enrollments.form.fields.status')}
              options={statusOptions}
              error={errors.status?.message}
              {...register('status', { valueAsNumber: true })}
            />

            <Select
              label={t('enrollments.form.fields.grade')}
              options={gradeOptions}
              error={errors.grade?.message}
              {...register('grade')}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? t('enrollments.form.actions.updateEnrollment') : t('enrollments.form.actions.createEnrollment')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrollmentForm;
