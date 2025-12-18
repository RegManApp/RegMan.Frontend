import clsx from 'clsx';

/**
 * Combine class names conditionally
 */
export const cn = (...classes) => clsx(...classes);

/**
 * Format date to display string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format datetime to display string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

/**
 * Get full name
 */
export const getFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format grade point
 */
export const getGradePoint = (grade) => {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  };
  return gradePoints[grade] ?? null;
};

/**
 * Calculate GPA from enrollments
 */
export const calculateGPA = (enrollments) => {
  // Status 1 = Completed
  const completedEnrollments = enrollments.filter(
    (e) => e.status === 1 && e.grade && getGradePoint(e.grade) !== null
  );
  
  if (completedEnrollments.length === 0) return null;
  
  const totalPoints = completedEnrollments.reduce((sum, e) => {
    const credits = e.course?.creditHours || 3;
    return sum + (getGradePoint(e.grade) * credits);
  }, 0);
  
  const totalCredits = completedEnrollments.reduce((sum, e) => {
    return sum + (e.course?.creditHours || 3);
  }, 0);
  
  return (totalPoints / totalCredits).toFixed(2);
};

/**
 * Get status badge color classes
 */
export const getStatusColor = (status) => {
  const colors = {
    // Enrollment status (numeric values)
    0: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', // Enrolled
    1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', // Completed
    2: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', // Dropped
    3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', // Failed
    // Enrollment status (string values)
    Enrolled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Dropped: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Failed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

/**
 * Get student level badge color classes
 */
export const getStudentLevelColor = (level) => {
  const colors = {
    0: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', // Freshman
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', // Sophomore
    2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', // Junior
    3: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', // Senior
  };
  return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

/**
 * Get role badge color classes
 */
export const getRoleColor = (role) => {
  const colors = {
    Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    Student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Instructor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Download file
 */
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
