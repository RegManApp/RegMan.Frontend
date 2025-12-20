import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal, Input, Select, Button } from '../common';
import { createInstructorSchema, updateInstructorSchema } from '../../utils/validators';
import { INSTRUCTOR_DEGREES } from '../../utils/constants';

const InstructorForm = ({
  isOpen,
  onClose,
  onSubmit,
  instructor = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(instructor?.instructorId || instructor?.id);
  const schema = isEditing ? updateInstructorSchema : createInstructorSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      title: '',
      degree: '',
      department: '',
      address: '',
    },
  });

  useEffect(() => {
    if (instructor) {
      // Parse fullName into firstName/lastName
      const nameParts = (instructor.fullName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      reset({
        firstName: firstName,
        lastName: lastName,
        title: instructor.title || '',
        degree: instructor.degree?.toString() || '',
        department: instructor.department || '',
        address: instructor.address || '',
      });
    } else {
      reset({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        title: '',
        degree: '',
        department: '',
        address: '',
      });
    }
  }, [instructor, reset]);

  const handleFormSubmit = (data) => {
    const submitData = { ...data };
    // Convert degree to number if provided
    if (submitData.degree !== '' && submitData.degree !== undefined) {
      submitData.degree = Number(submitData.degree);
    } else {
      delete submitData.degree;
    }
    onSubmit(submitData);
  };

  const degreeOptions = [
    { value: '', label: 'Select Degree' },
    ...INSTRUCTOR_DEGREES.map((deg) => ({
      value: deg.value,
      label: deg.label,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Instructor' : 'Add New Instructor'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {!isEditing && (
          <>
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Title"
          placeholder="e.g., Dr., Prof."
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Academic Degree"
            options={degreeOptions}
            error={errors.degree?.message}
            {...register('degree')}
          />
          <Input
            label="Department"
            placeholder="e.g., Computer Science"
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <Input
          label="Address"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Update Instructor' : 'Create Instructor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InstructorForm;
