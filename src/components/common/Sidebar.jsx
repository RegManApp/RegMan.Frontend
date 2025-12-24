import { Fragment, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../hooks/useDirection';

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
    sectionKey: 'nav.core',
    items: [
      { labelKey: 'nav.dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { labelKey: 'nav.students', href: '/students', icon: 'UsersIcon' },
      { labelKey: 'nav.instructors', href: '/instructors', icon: 'AcademicCapIcon' },
      { labelKey: 'nav.courses', href: '/courses', icon: 'BookOpenIcon' },
      { labelKey: 'nav.sections', href: '/sections', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.schedules', href: '/schedules', icon: 'CalendarDaysIcon' },
      { labelKey: 'nav.rooms', href: '/rooms', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.enrollments', href: '/enrollments', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
    ],
  },
  {
    sectionKey: 'nav.support',
    items: [
      { labelKey: 'nav.chat', href: '/chat', icon: 'ChatIcon' },
      { labelKey: 'nav.advising', href: '/advising', icon: 'ClipboardDocumentCheckIcon' },
      { labelKey: 'nav.withdrawRequests', href: '/admin/withdraw-requests', icon: 'ClipboardDocumentCheckIcon' },
    ],
  },
  {
    sectionKey: 'nav.admin',
    items: [
      { labelKey: 'nav.users', href: '/users', icon: 'UserGroupIcon' },
      { labelKey: 'nav.analytics', href: '/analytics', icon: 'ChartBarIcon' },
      { labelKey: 'nav.gpaAndGrades', href: '/gpa', icon: 'AcademicCapIcon' },
      { labelKey: 'nav.academicPlan', href: '/academic-plan', icon: 'AcademicCapIcon' },
      { labelKey: 'nav.transcript', href: '/transcript', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.timeSlots', href: '/time-slots', icon: 'ClockIcon' },
      { labelKey: 'nav.adminSettings', href: '/settings', icon: 'UserIcon' },
    ],
  },
];

const instructorNavigation = [
  {
    sectionKey: 'nav.core',
    items: [
      { labelKey: 'nav.dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { labelKey: 'nav.myCourses', href: '/courses', icon: 'BookOpenIcon' },
      { labelKey: 'nav.sections', href: '/sections', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.officeHours', href: '/office-hours', icon: 'ClockIcon' },
      { labelKey: 'nav.calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
    ],
  },
  {
    sectionKey: 'nav.support',
    items: [
      { labelKey: 'nav.chat', href: '/chat', icon: 'ChatIcon' },
      { labelKey: 'nav.advising', href: '/advising', icon: 'ClipboardDocumentCheckIcon' },
      { labelKey: 'nav.profile', href: '/profile', icon: 'UserIcon' },
    ],
  },
];

const studentNavigation = [
  {
    sectionKey: 'nav.core',
    items: [
      { labelKey: 'nav.dashboard', href: '/dashboard', icon: 'HomeIcon' },
      { labelKey: 'nav.courses', href: '/courses', icon: 'BookOpenIcon' },
      { labelKey: 'nav.smartSchedule', href: '/smart-schedule', icon: 'CalendarDaysIcon' },
      { labelKey: 'nav.cart', href: '/cart', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.myEnrollments', href: '/enrollments', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.calendar', href: '/calendar', icon: 'CalendarDaysIcon' },
      { labelKey: 'nav.bookOfficeHours', href: '/book-office-hours', icon: 'ClockIcon' },
    ],
  },
  {
    sectionKey: 'nav.support',
    items: [
      { labelKey: 'nav.chat', href: '/chat', icon: 'ChatIcon' },
      { labelKey: 'nav.gpaAndGrades', href: '/gpa', icon: 'AcademicCapIcon' },
      { labelKey: 'nav.academicPlan', href: '/academic-plan', icon: 'AcademicCapIcon' },
      { labelKey: 'nav.transcript', href: '/transcript', icon: 'ClipboardDocumentListIcon' },
      { labelKey: 'nav.withdrawRequest', href: '/withdraw-request', icon: 'ClipboardDocumentCheckIcon' },
      { labelKey: 'nav.withdrawHistory', href: '/withdraw-history', icon: 'ClipboardDocumentCheckIcon' },
      { labelKey: 'nav.profile', href: '/profile', icon: 'UserIcon' },
    ],
  },
];

const SidebarContent = ({ navigation, sectionOpen, onToggleSection }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  const sectionIdByKey = useMemo(() => ({
    'nav.core': 'sidebar-section-core',
    'nav.support': 'sidebar-section-support',
    'nav.admin': 'sidebar-section-admin',
  }), []);

  const isSectionOpen = (sectionKey) => {
    if (sectionKey === 'nav.core') return sectionOpen.core;
    if (sectionKey === 'nav.support') return sectionOpen.support;
    if (sectionKey === 'nav.admin') return sectionOpen.admin;
    return true;
  };

  const toggleSection = (sectionKey) => {
    if (sectionKey === 'nav.core') return onToggleSection('core');
    if (sectionKey === 'nav.support') return onToggleSection('support');
    if (sectionKey === 'nav.admin') return onToggleSection('admin');
  };

  return (
    <nav className="flex-1 px-2 py-4 space-y-4 overflow-x-hidden">
      {navigation.map((group) => (
        <div key={group.sectionKey}>
          <button
            type="button"
            onClick={() => toggleSection(group.sectionKey)}
            aria-expanded={isSectionOpen(group.sectionKey)}
            aria-controls={sectionIdByKey[group.sectionKey]}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg',
              'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500'
            )}
          >
            <span>{t(group.sectionKey)}</span>
            {isSectionOpen(group.sectionKey) ? (
              <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRightIcon className={cn('h-4 w-4 flex-shrink-0', isRtl && 'rtl-flip')} />
            )}
          </button>

          <div
            id={sectionIdByKey[group.sectionKey]}
            className={cn(
              'grid transition-[grid-template-rows] duration-200 ease-in-out',
              isSectionOpen(group.sectionKey) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden">
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

                  return (
                    <NavLink
                      key={item.labelKey}
                      to={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors overflow-x-hidden',
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            isRtl ? 'ml-3' : 'mr-3',
                            isActive
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                          )}
                        />
                      )}
                      <span className="min-w-0 truncate">{t(item.labelKey)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
};

const Sidebar = ({ isOpen = false, onClose }) => {
  const { isAdmin, isInstructor } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  // Collapse state is local to Sidebar (no persistence)
  const [sectionOpen, setSectionOpen] = useState({
    core: true,
    support: true,
    admin: false,
  });

  const onToggleSection = (key) => {
    setSectionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
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
              enterFrom={isRtl ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo={isRtl ? 'translate-x-full' : '-translate-x-full'}
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
                  <div className={cn('absolute top-0 pt-2', isRtl ? 'left-0 -ml-12' : 'right-0 -mr-12')}>
                    <button
                      type="button"
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white',
                        isRtl ? 'mr-1' : 'ml-1'
                      )}
                      onClick={onClose}
                    >
                      <span className="sr-only">{t('a11y.closeSidebar')}</span>
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-700">
                  <img
                    src="/logo-light.png"
                    alt={t('app.name')}
                    className="h-8 w-8 dark:hidden"
                  />
                  <img
                    src="/logo-dark.png"
                    alt={t('app.name')}
                    className="h-8 w-8 hidden dark:block"
                  />
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {t('app.name')}
                  </span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
                  <SidebarContent
                    navigation={navigation}
                    sectionOpen={sectionOpen}
                    onToggleSection={onToggleSection}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" />
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col', isRtl ? 'lg:right-0' : 'lg:left-0')}>
        <div className={cn(
          'flex flex-col flex-grow min-h-0 bg-white dark:bg-gray-800 pt-16',
          isRtl ? 'border-l border-gray-200 dark:border-gray-700' : 'border-r border-gray-200 dark:border-gray-700'
        )}>
          <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/logo-light.png"
              alt={t('app.name')}
              className="h-8 w-8 dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt={t('app.name')}
              className="h-8 w-8 hidden dark:block"
            />
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {t('app.name')}
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain">
            <SidebarContent
              navigation={navigation}
              sectionOpen={sectionOpen}
              onToggleSection={onToggleSection}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
