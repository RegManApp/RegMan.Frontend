import { useEffect, useState } from 'react';
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
  courses = [],
  isLoading,
}) => {
  const isEditing = !!enrollment?.id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEditing ? updateEnrollmentSchema : createEnrollmentSchema),
    defaultValues: {
      studentId: '',
      courseId: '',
      semester: '',
      status: 0,
      grade: '',
    },
  });

  useEffect(() => {
    if (enrollment?.id) {
      reset({
        status: enrollment.status ?? 0,
        grade: enrollment.grade || '',
      });
    } else {
      reset({
        studentId: '',
        courseId: '',
        semester: '',
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
      onSubmit({
        studentId: Number(data.studentId),
        courseId: Number(data.courseId),
        semester: data.semester,
      });
    }
  };

  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${getFullName(student.user?.firstName, student.user?.lastName)} (${student.studentNumber})`,
  }));

  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: `${course.courseCode} - ${course.courseName}`,
  }));

  const statusOptions = ENROLLMENT_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  const semesterOptions = SEMESTERS.map((sem) => ({
    value: sem,
    label: sem,
  }));

  const gradeOptions = [
    { value: '', label: 'No Grade' },
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
      title={isEditing ? 'Edit Enrollment' : 'Create New Enrollment'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {!isEditing && (
          <>
            <Select
              label="Student"
              placeholder="Select a student"
              options={studentOptions}
              error={errors.studentId?.message}
              {...register('studentId')}
            />

            <Select
              label="Course"
              placeholder="Select a course"
              options={courseOptions}
              error={errors.courseId?.message}
              {...register('courseId')}
            />

            <Select
              label="Semester"
              placeholder="Select a semester"
              options={semesterOptions}
              error={errors.semester?.message}
              {...register('semester')}
            />
          </>
        )}

        {isEditing && (
          <>
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Student: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getFullName(
                    enrollment?.student?.user?.firstName,
                    enrollment?.student?.user?.lastName
                  )}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Course: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {enrollment?.course?.courseName} ({enrollment?.course?.courseCode})
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Semester: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {enrollment?.semester || '-'}
                </span>
              </p>
            </div>

            <Select
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
              {...register('status', { valueAsNumber: true })}
            />

            <Select
              label="Grade"
              options={gradeOptions}
              error={errors.grade?.message}
              {...register('grade')}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Update Enrollment' : 'Create Enrollment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrollmentForm;
