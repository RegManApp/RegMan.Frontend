// Application constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || "RegMan";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// User roles
export const ROLES = {
  ADMIN: "Admin",
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
};

// Instructor degrees/titles
export const INSTRUCTOR_DEGREES = [
  { value: 0, label: "Teaching Assistant", shortLabel: "TA" },
  { value: 1, label: "Assistant Lecturer", shortLabel: "AL" },
  { value: 2, label: "Lecturer", shortLabel: "Lect." },
  { value: 3, label: "Assistant Professor", shortLabel: "Asst. Prof." },
  { value: 4, label: "Associate Professor", shortLabel: "Assoc. Prof." },
  { value: 5, label: "Professor", shortLabel: "Prof." },
];

// String-based degree values (from backend)
export const INSTRUCTOR_DEGREE_STRINGS = {
  TeachingAssistant: { label: "Teaching Assistant", shortLabel: "TA" },
  AssistantLecturer: { label: "Assistant Lecturer", shortLabel: "AL" },
  Lecturer: { label: "Lecturer", shortLabel: "Lect." },
  AssistantProfessor: {
    label: "Assistant Professor",
    shortLabel: "Asst. Prof.",
  },
  AssociateProfessor: {
    label: "Associate Professor",
    shortLabel: "Assoc. Prof.",
  },
  Professor: { label: "Professor", shortLabel: "Prof." },
};

// Student levels
export const STUDENT_LEVELS = [
  { value: 0, label: "Freshman" },
  { value: 1, label: "Sophomore" },
  { value: 2, label: "Junior" },
  { value: 3, label: "Senior" },
];

// Enrollment status
export const ENROLLMENT_STATUSES = [
  { value: 0, label: "Enrolled" },
  { value: 1, label: "Completed" },
  { value: 2, label: "Dropped" },
  { value: 3, label: "Failed" },
];

// Days of week
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Grade options
export const GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];

// Pagination defaults
export const PAGE_SIZES = [10, 20, 50, 100];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: PAGE_SIZES,
};

// Semesters
export const SEMESTERS = [
  "Fall 2024",
  "Spring 2025",
  "Summer 2025",
  "Fall 2025",
  "Spring 2026",
];

// Navigation items
export const NAV_ITEMS = {
  ADMIN: [
    { name: "Dashboard", path: "/dashboard", icon: "HomeIcon" },
    { name: "Students", path: "/students", icon: "AcademicCapIcon" },
    { name: "Instructors", path: "/instructors", icon: "UserGroupIcon" },
    { name: "Courses", path: "/courses", icon: "BookOpenIcon" },
    {
      name: "Enrollments",
      path: "/enrollments",
      icon: "ClipboardDocumentListIcon",
    },
    { name: "Schedules", path: "/schedules", icon: "CalendarDaysIcon" },
    { name: "Users", path: "/users", icon: "UsersIcon" },
  ],
  INSTRUCTOR: [
    { name: "Dashboard", path: "/dashboard", icon: "HomeIcon" },
    { name: "My Courses", path: "/courses", icon: "BookOpenIcon" },
    { name: "Students", path: "/students", icon: "AcademicCapIcon" },
    { name: "Schedules", path: "/schedules", icon: "CalendarDaysIcon" },
    { name: "Profile", path: "/profile", icon: "UserIcon" },
  ],
  STUDENT: [
    { name: "Dashboard", path: "/dashboard", icon: "HomeIcon" },
    { name: "Courses", path: "/courses", icon: "BookOpenIcon" },
    {
      name: "My Enrollments",
      path: "/enrollments",
      icon: "ClipboardDocumentListIcon",
    },
    { name: "Schedule", path: "/schedules", icon: "CalendarDaysIcon" },
    { name: "Profile", path: "/profile", icon: "UserIcon" },
  ],
};

// Toast duration
export const TOAST_DURATION = 4000;

// Helper functions for enums
export const getStudentLevelLabel = (value) => {
  const level = STUDENT_LEVELS.find((l) => l.value === value);
  return level?.label || "Unknown";
};

export const getEnrollmentStatusLabel = (value) => {
  const status = ENROLLMENT_STATUSES.find((s) => s.value === value);
  return status?.label || "Unknown";
};

export const getDayOfWeekLabel = (value) => {
  const day = DAYS_OF_WEEK.find((d) => d.value === value);
  return day?.label || "Unknown";
};

export const getInstructorDegreeLabel = (value) => {
  // Handle numeric values
  if (typeof value === "number") {
    const degree = INSTRUCTOR_DEGREES.find((d) => d.value === value);
    return degree?.label || "Instructor";
  }
  // Handle string values
  const degree = INSTRUCTOR_DEGREE_STRINGS[value];
  return degree?.label || value || "Instructor";
};

export const getInstructorDegreeShortLabel = (value) => {
  if (typeof value === "number") {
    const degree = INSTRUCTOR_DEGREES.find((d) => d.value === value);
    return degree?.shortLabel || "Instr.";
  }
  const degree = INSTRUCTOR_DEGREE_STRINGS[value];
  return degree?.shortLabel || value || "Instr.";
};
