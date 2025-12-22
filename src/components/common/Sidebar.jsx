import { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/helpers';

const iconMap = {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChatIcon: ChatBubbleLeftRightIcon,
  ClockIcon,
};

const adminNavigation = [
  {
    section: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { name: 'Students', href: '/students', icon: 'UsersIcon' },
      { name: 'Instructors', href: '/instructors', icon: 'AcademicCapIcon' },
      { name: 'Courses', href: '/courses', icon: 'BookOpenIcon' },
      { name: 'Sections', href: '/sections', icon: 'ClipboardDocumentListIcon' },
      { name: 'Schedules', href: '/schedules', icon: 'CalendarDaysIcon' },
      { name: 'Rooms', href: '/rooms', icon: 'ClipboardDocumentListIcon' },
      { name: 'Enrollments', href: '/enrollments', icon: 'ClipboardDocumentListIcon' },
      { name: 'Calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
    ],
  },
  {
    section: 'Support',
    items: [
      { name: 'Chat', href: '/chat', icon: 'ChatIcon' },
      { name: 'Advising', href: '/advising', icon: 'ClipboardDocumentCheckIcon' },
      { name: 'Withdraw Requests', href: '/admin/withdraw-requests', icon: 'ClipboardDocumentCheckIcon' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { name: 'Users', href: '/users', icon: 'UserGroupIcon' },
      { name: 'Analytics', href: '/analytics', icon: 'ChartBarIcon' },
      { name: 'GPA & Grades', href: '/gpa', icon: 'AcademicCapIcon' },
      { name: 'Academic Plan', href: '/academic-plan', icon: 'AcademicCapIcon' },
      { name: 'Transcript', href: '/transcript', icon: 'ClipboardDocumentListIcon' },
    ],
  },
];

const instructorNavigation = [
  {
    section: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { name: 'My Courses', href: '/courses', icon: 'BookOpenIcon' },
      { name: 'Office Hours', href: '/office-hours', icon: 'ClockIcon' },
      { name: 'Calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
    ],
  },
  {
    section: 'Support',
    items: [
      { name: 'Chat', href: '/chat', icon: 'ChatIcon' },
      { name: 'Profile', href: '/profile', icon: 'UserIcon' },
    ],
  },
];

const studentNavigation = [
  {
    section: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { name: 'Courses', href: '/courses', icon: 'BookOpenIcon' },
      { name: 'Smart Schedule', href: '/smart-schedule', icon: 'CalendarDaysIcon' },
      { name: 'Cart', href: '/cart', icon: 'ClipboardDocumentListIcon' },
      { name: 'My Enrollments', href: '/enrollments', icon: 'ClipboardDocumentListIcon' },
      { name: 'Calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
      { name: 'Book Office Hours', href: '/book-office-hours', icon: 'ClockIcon' },
    ],
  },
  {
    section: 'Support',
    items: [
      { name: 'Chat', href: '/chat', icon: 'ChatIcon' },
      { name: 'GPA & Grades', href: '/gpa', icon: 'AcademicCapIcon' },
      { name: 'Academic Plan', href: '/academic-plan', icon: 'AcademicCapIcon' },
      { name: 'Transcript', href: '/transcript', icon: 'ClipboardDocumentListIcon' },
      { name: 'Withdraw Request', href: '/withdraw-request', icon: 'ClipboardDocumentCheckIcon' },
      { name: 'Profile', href: '/profile', icon: 'UserIcon' },
    ],
  },
];

const SidebarContent = ({ navigation }) => {
  const location = useLocation();

  return (
    <nav className="flex-1 px-2 py-4 space-y-6">
      {navigation.map((group) => (
        <div key={group.section}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {group.section}
          </p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                  )}
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

const Sidebar = ({ isOpen = false, onClose }) => {
  const { isAdmin, isInstructor } = useAuth();
  
  let navigation;
  if (isAdmin()) {
    navigation = adminNavigation;
  } else if (isInstructor()) {
    navigation = instructorNavigation;
  } else {
    navigation = studentNavigation;
  }

  // Defensive: only render Transition if isOpen is boolean
  if (typeof isOpen !== 'boolean') return null;
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600/75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    RegMan
                  </span>
                </div>

                <div className="flex-1 h-0 overflow-y-auto">
                  <SidebarContent navigation={navigation} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" />
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <SidebarContent navigation={navigation} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
