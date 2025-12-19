import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn, getFullName } from '../../utils/helpers';
import Avatar from './Avatar';
import AccountSwitcher from './AccountSwitcher';
import NotificationBell from '../NotificationBell';

const Navbar = ({ onMenuClick, showMenuButton = true }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                type="button"
                className="lg:hidden -ml-2 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                onClick={onMenuClick}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                RegMan
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Toggle theme</span>
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Account Switcher */}
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
