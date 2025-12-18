import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { courseSchema } from '../../utils/validators';
import { Modal, Button, Input, Textarea } from '../common';
import CourseCategorySelect from './CourseCategorySelect';

const CourseForm = ({
  isOpen,
  onClose,
  onSubmit,
  course,
  isLoading,
  isAdmin = true,
}) => {
  const isEditing = !!course?.id;
  const [categoryId, setCategoryId] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      courseCode: '',
      courseName: '',
      description: '',
      creditHours: 3,
      courseCategoryId: '',
    },
  });

  useEffect(() => {
    if (course?.id) {
      reset({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        description: course.description || '',
        creditHours: course.creditHours || 3,
        courseCategoryId: course.courseCategoryId || '',
      });
      setCategoryId(course.courseCategoryId || '');
    } else {
      reset({
        courseCode: '',
        courseName: '',
        description: '',
        creditHours: 3,
        courseCategoryId: '',
      });
      setCategoryId('');
    }
  }, [course, reset]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryId(value);
    setValue('courseCategoryId', value ? Number(value) : '');
  };

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      courseCategoryId: Number(data.courseCategoryId),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Course' : 'Create New Course'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Course Code"
            placeholder="e.g., CS101"
            error={errors.courseCode?.message}
            {...register('courseCode')}
          />
          <Input
            label="Credit Hours"
            type="number"
            min={1}
            max={6}
            error={errors.creditHours?.message}
            {...register('creditHours', { valueAsNumber: true })}
          />
        </div>

        <Input
          label="Course Name"
          placeholder="e.g., Introduction to Computer Science"
          error={errors.courseName?.message}
          {...register('courseName')}
        />

        <CourseCategorySelect
          value={categoryId}
          onChange={handleCategoryChange}
          error={errors.courseCategoryId?.message}
          isAdmin={isAdmin}
        />

        <Textarea
          label="Description"
          placeholder="Enter course description..."
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEditing ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseForm;
