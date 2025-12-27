import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createStudentSchema, updateStudentSchema } from '../../utils/validators';
import { STUDENT_LEVELS } from '../../utils/constants';
import { Modal, Button, Input, Select } from '../common';
import { useTranslation } from 'react-i18next';

const StudentForm = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  isLoading,
}) => {
  const isEditing = !!student?.id;
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEditing ? updateStudentSchema : createStudentSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      address: '',
      city: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      studentLevel: 0,
    },
  });

  useEffect(() => {
    if (student?.id) {
      reset({
        firstName: student.user?.firstName || '',
        lastName: student.user?.lastName || '',
        phoneNumber: student.user?.phoneNumber || '',
        dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
        address: student.address || '',
        city: student.city || '',
        studentLevel: student.studentLevel ?? 0,
      });
    } else {
      reset({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        city: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        studentLevel: 0,
      });
    }
  }, [student, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      studentLevel: Number(data.studentLevel),
    });
  };

  const levelOptions = STUDENT_LEVELS.map((level) => {
    const value = level.value;
    const key = value === 0
      ? 'freshman'
      : value === 1
        ? 'sophomore'
        : value === 2
          ? 'junior'
          : value === 3
            ? 'senior'
            : null;
    return {
      value,
      label: !key ? t('common.notAvailable') : t(`enums.studentLevel.${key}`),
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('students.form.editTitle') : t('students.form.createTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {!isEditing && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('common.email')}
                type="email"
                placeholder={t('students.placeholders.email')}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('auth.password')}
                type="password"
                placeholder={t('students.placeholders.password')}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('students.fields.firstName')}
            placeholder={t('students.placeholders.firstName')}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label={t('students.fields.lastName')}
            placeholder={t('students.placeholders.lastName')}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('students.fields.phoneNumber')}
            placeholder={t('students.placeholders.phoneNumber')}
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <Input
            label={t('students.fields.dateOfBirth')}
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('students.fields.address')}
            placeholder={t('students.placeholders.address')}
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label={t('common.city')}
            placeholder={t('students.placeholders.city')}
            error={errors.city?.message}
            {...register('city')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isEditing && (
            <Input
              label={t('students.fields.enrollmentDate')}
              type="date"
              error={errors.enrollmentDate?.message}
              {...register('enrollmentDate')}
            />
          )}
          <Select
            label={t('students.fields.studentLevel')}
            options={levelOptions}
            error={errors.studentLevel?.message}
            {...register('studentLevel', { valueAsNumber: true })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? t('students.form.updateAction') : t('students.form.createAction')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentForm;
