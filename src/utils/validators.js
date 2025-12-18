import * as yup from 'yup';

// Password validation regex (min 8 chars, uppercase, lowercase, digit, special character)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Course code regex (max 20 chars)
const courseCodeRegex = /^[A-Z0-9]{1,20}$/i;

/**
 * Login validation schema
 */
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

/**
 * Registration validation schema
 */
export const registerSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)'
    )
    .notOneOf([yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

/**
 * Student creation validation schema
 */
export const createStudentSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phoneNumber: yup
    .string()
    .nullable(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .nullable(),
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .nullable(),
  enrollmentDate: yup
    .date()
    .required('Enrollment date is required'),
  studentLevel: yup
    .number()
    .oneOf([0, 1, 2, 3], 'Invalid student level')
    .required('Student level is required'),
});

/**
 * Student update validation schema
 */
export const updateStudentSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phoneNumber: yup
    .string()
    .nullable(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future'),
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .nullable(),
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .nullable(),
  studentLevel: yup
    .number()
    .oneOf([0, 1, 2, 3], 'Invalid student level'),
});

/**
 * Course validation schema
 */
export const courseSchema = yup.object({
  courseName: yup
    .string()
    .min(3, 'Course name must be at least 3 characters')
    .max(100, 'Course name must be less than 100 characters')
    .required('Course name is required'),
  courseCode: yup
    .string()
    .max(20, 'Course code must be less than 20 characters')
    .matches(courseCodeRegex, 'Invalid course code format')
    .required('Course code is required'),
  creditHours: yup
    .number()
    .min(1, 'Credit hours must be at least 1')
    .max(6, 'Credit hours must be at most 6')
    .required('Credit hours is required'),
  courseCategoryId: yup
    .number()
    .required('Course category is required'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters')
    .nullable(),
});

/**
 * Course category validation schema
 */
export const courseCategorySchema = yup.object({
  name: yup
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters')
    .required('Category name is required'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters')
    .nullable(),
});

/**
 * Instructor creation validation schema
 */
export const createInstructorSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phoneNumber: yup
    .string()
    .nullable(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .nullable(),
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .nullable(),
  hireDate: yup
    .date()
    .required('Hire date is required'),
  departmentId: yup
    .number()
    .nullable(),
});

/**
 * Instructor update validation schema
 */
export const updateInstructorSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phoneNumber: yup
    .string()
    .nullable(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future'),
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .nullable(),
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .nullable(),
  hireDate: yup
    .date(),
  departmentId: yup
    .number()
    .nullable(),
});

/**
 * Enrollment creation validation schema
 */
export const createEnrollmentSchema = yup.object({
  studentId: yup
    .number()
    .required('Student is required'),
  courseId: yup
    .number()
    .required('Course is required'),
  semester: yup
    .string()
    .required('Semester is required'),
});

/**
 * Enrollment update validation schema
 */
export const updateEnrollmentSchema = yup.object({
  grade: yup
    .string()
    .nullable()
    .oneOf([null, '', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'], 'Invalid grade'),
  status: yup
    .number()
    .oneOf([0, 1, 2, 3], 'Invalid status'),
});

/**
 * Schedule validation schema
 */
export const scheduleSchema = yup.object({
  courseId: yup
    .number()
    .required('Course is required'),
  instructorId: yup
    .number()
    .required('Instructor is required'),
  dayOfWeek: yup
    .number()
    .min(0, 'Invalid day')
    .max(6, 'Invalid day')
    .required('Day of week is required'),
  startTime: yup
    .string()
    .required('Start time is required'),
  endTime: yup
    .string()
    .required('End time is required'),
  roomNumber: yup
    .string()
    .max(50, 'Room number must be less than 50 characters')
    .required('Room number is required'),
  semester: yup
    .string()
    .required('Semester is required'),
});

/**
 * Profile update validation schema
 */
export const profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phoneNumber: yup
    .string()
    .nullable(),
});

/**
 * User update validation schema (for admin user management)
 */
export const userSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phoneNumber: yup
    .string()
    .nullable(),
  isActive: yup
    .boolean(),
});

/**
 * Role assignment validation schema
 */
export const roleSchema = yup.object({
  newRole: yup
    .string()
    .oneOf(['Admin', 'Student', 'Instructor'], 'Invalid role')
    .required('Role is required'),
});

// Export all schemas
export default {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  createStudentSchema,
  updateStudentSchema,
  courseSchema,
  courseCategorySchema,
  createInstructorSchema,
  updateInstructorSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  scheduleSchema,
  profileSchema,
  userSchema,
  roleSchema,
};
