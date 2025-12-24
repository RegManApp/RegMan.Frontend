import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronDown, FiUserPlus, FiLogOut, FiTrash2, FiUsers, FiCheck, FiX, FiUser, FiSettings } from 'react-icons/fi';
import { devToolsApi } from '../../api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AccountSwitcher = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmResetDemo, setShowConfirmResetDemo] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const {
    user,
    savedAccounts,
    saveCurrentAccount,
    switchAccount,
    removeAccount,
    clearAllSavedAccounts,
    logout,
    setSessionFromLoginResponse,
  } = useAuth();

  const isDev = import.meta.env.DEV;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowConfirmClear(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get other saved accounts (not current user)
  const otherAccounts = savedAccounts.filter(acc => acc.id !== user?.id);
  
  // Check if current account is already saved
  const isCurrentAccountSaved = savedAccounts.some(acc => acc.id === user?.id);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Instructor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Student':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddAccount = () => {
    saveCurrentAccount();
    logout();
    navigate('/login');
  };

  const handleSwitchAccount = async (accountId) => {
    await switchAccount(accountId);
    setIsOpen(false);
    navigate('/dashboard');
  };

  const handleRemoveAccount = (e, accountId) => {
    e.stopPropagation();
    removeAccount(accountId);
  };

  const handleClearAll = () => {
    clearAllSavedAccounts();
    setShowConfirmClear(false);
  };

  const handleDemoLoginAs = async (email) => {
    setDemoBusy(true);
    try {
      const response = await devToolsApi.loginAs(email);
      // Clear saved accounts since tokens become irrelevant
      clearAllSavedAccounts();
      setSessionFromLoginResponse(response.data, true);
      toast.success(t('accountSwitcher.toasts.switchedToEmail', { email }));
      setIsOpen(false);
      setShowConfirmResetDemo(false);
      navigate('/dashboard');
    } catch (e) {
      // axios interceptor already toasts
    } finally {
      setDemoBusy(false);
    }
  };

  const handleDemoSeed = async () => {
    setDemoBusy(true);
    try {
      await devToolsApi.seed();
      toast.success(t('accountSwitcher.toasts.demoSeeded'));
    } catch (e) {
      // axios interceptor already toasts
    } finally {
      setDemoBusy(false);
    }
  };

  const handleDemoReset = async () => {
    setDemoBusy(true);
    try {
      await devToolsApi.reset();
      clearAllSavedAccounts();
      toast.success(t('accountSwitcher.toasts.demoReset'));

      const loginResponse = await devToolsApi.loginAs('admin@demo.local');
      setSessionFromLoginResponse(loginResponse.data, true);
      toast.success(t('accountSwitcher.toasts.loggedInAsAdminDemo'));
      setIsOpen(false);
    } catch (e) {
      // axios interceptor already toasts
    } finally {
      setDemoBusy(false);
      setShowConfirmResetDemo(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {/* Current User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
          {getInitials(user.fullName)}
        </div>
        
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
            {user.fullName || user.email}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {user.role}
          </div>
        </div>
        
        {/* Account count badge */}
        {savedAccounts.length > 0 && (
          <span className="hidden sm:flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
            {savedAccounts.length}
          </span>
        )}
        
        <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* Current Account Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {user.fullName || t('common.user')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            
            {!isCurrentAccountSaved && (
              <button
                onClick={saveCurrentAccount}
                className="mt-2 w-full px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                {t('accountSwitcher.saveThisAccount')}
              </button>
            )}
          </div>

          {/* Saved Accounts List */}
          {otherAccounts.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('accountSwitcher.switchAccount')}
              </div>
              {otherAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSwitchAccount(account.id)}
                  className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {getInitials(account.fullName)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {account.fullName || account.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded ${getRoleColor(account.role)}`}>
                        {account.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveAccount(e, account.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title={t('accountSwitcher.removeAccount')}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            {/* Profile and Settings links */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
            >
              <FiUser className="w-4 h-4" />
              {t('accountSwitcher.yourProfile')}
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              {t('accountSwitcher.settings')}
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={handleAddAccount}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
            >
              <FiUserPlus className="w-4 h-4" />
              {t('accountSwitcher.addAnotherAccount')}
              <span className="ml-auto text-xs text-gray-400">
                {savedAccounts.length}/10
              </span>
            </button>

            {savedAccounts.length > 0 && (
              <>
                {showConfirmClear ? (
                  <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                      {t('accountSwitcher.confirmClearTitle')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAll}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        {t('accountSwitcher.confirmClearYes')}
                      </button>
                      <button
                        onClick={() => setShowConfirmClear(false)}
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    {t('accountSwitcher.clearAllSavedAccounts')}
                  </button>
                )}
              </>
            )}

            {isDev && user?.role === 'Admin' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                <div className="px-4 py-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FiUsers className="w-4 h-4" />
                    {t('accountSwitcher.demoTools')}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      disabled={demoBusy}
                      onClick={() => handleDemoLoginAs('admin@demo.local')}
                      className="px-2 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Admin
                    </button>
                    <button
                      disabled={demoBusy}
                      onClick={() => handleDemoLoginAs('instructor@demo.local')}
                      className="px-2 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Instructor
                    </button>
                    <button
                      disabled={demoBusy}
                      onClick={() => handleDemoLoginAs('student@demo.local')}
                      className="px-2 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Student
                    </button>
                  </div>

                  <button
                    disabled={demoBusy}
                    onClick={handleDemoSeed}
                    className="mt-2 w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {t('accountSwitcher.seedDemoData')}
                  </button>

                  {showConfirmResetDemo ? (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                        {t('accountSwitcher.confirmResetDemoTitle')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={demoBusy}
                          onClick={handleDemoReset}
                          className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {t('accountSwitcher.confirmResetDemoYes')}
                        </button>
                        <button
                          disabled={demoBusy}
                          onClick={() => setShowConfirmResetDemo(false)}
                          className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={demoBusy}
                      onClick={() => setShowConfirmResetDemo(true)}
                      className="mt-2 w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {t('accountSwitcher.resetDemoDatabase')}
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              {t('accountSwitcher.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
