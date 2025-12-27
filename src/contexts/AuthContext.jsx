import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
import i18n from '../i18n';

// Parse JWT token to extract payload
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  savedAccounts: [],
};

// Maximum number of saved accounts
const MAX_SAVED_ACCOUNTS = 10;

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SAVED_ACCOUNTS: 'SET_SAVED_ACCOUNTS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.SET_SAVED_ACCOUNTS:
      return { ...state, savedAccounts: action.payload };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set session from a LoginResponse-like payload (accessToken/refreshToken + user fields)
  const setSessionFromLoginResponse = useCallback((loginResponse, rememberMe = true) => {
    if (!loginResponse?.accessToken || !loginResponse?.refreshToken) {
      throw new Error('Missing tokens');
    }

    const {
      accessToken,
      refreshToken,
      email: userEmail,
      fullName,
      role,
      userId,
      instructorTitle,
    } = loginResponse;

    const nameParts = fullName?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = {
      id: userId,
      email: userEmail,
      role,
      firstName,
      lastName,
      fullName,
      instructorTitle,
    };

    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear both storages first to avoid conflicts
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('user', JSON.stringify(user));
    localStorage.setItem('rememberMe', rememberMe.toString());

    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
    return user;
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check both localStorage (remember me) and sessionStorage (session only)
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Clear from both storages
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('rememberMe');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }

        if (userData) {
          try {
            const user = JSON.parse(userData);
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
          } catch {
            // If stored user data is corrupted, try to get fresh data
            try {
              const response = await authApi.getCurrentUser();
              dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
              // Store in appropriate storage based on rememberMe setting
              const storage = rememberMe ? localStorage : sessionStorage;
              storage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              localStorage.removeItem('rememberMe');
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');
              sessionStorage.removeItem('user');
              dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: null });
            }
          }
        } else {
          // Token exists but no user data, fetch from API
          try {
            const response = await authApi.getCurrentUser();
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(response.data));
          } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: null });
          }
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }

      // Load saved accounts from localStorage
      const savedAccountsData = localStorage.getItem('savedAccounts');
      if (savedAccountsData) {
        try {
          const accounts = JSON.parse(savedAccountsData);
          dispatch({ type: AUTH_ACTIONS.SET_SAVED_ACCOUNTS, payload: accounts });
        } catch {
          localStorage.removeItem('savedAccounts');
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await authApi.login({ email, password });
      // Response format: { accessToken, refreshToken, email, fullName, role, userId, instructorTitle }
      const { accessToken, refreshToken, email: userEmail, fullName, role, userId, instructorTitle } = response.data;

      // Parse full name into firstName and lastName
      const nameParts = fullName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const user = {
        id: userId,
        email: userEmail,
        role,
        firstName,
        lastName,
        fullName,
        instructorTitle,
      };

      // Choose storage based on "Remember me" checkbox
      // localStorage persists after browser close, sessionStorage clears on close
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Clear both storages first to avoid conflicts
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');

      // Store in appropriate storage
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
      storage.setItem('user', JSON.stringify(user));
      
      // Always store rememberMe preference in localStorage
      localStorage.setItem('rememberMe', rememberMe.toString());

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      toast.success(i18n.t('auth.loginSuccess'));
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || i18n.t('auth.loginFailed');
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      // Transform userData to match backend DTO
      // Backend expects: { fullName, email, address, role, password }
      // Frontend sends: { firstName, lastName, email, password, confirmPassword, role }
      const transformedData = {
        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        address: userData.address || '',
        role: 'Student', // Always Student for public registration
        password: userData.password,
      };
      
      await authApi.register(transformedData);
      toast.success(i18n.t('auth.registrationSuccess'));
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || i18n.t('auth.registrationFailed');
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      // Ignore logout API errors
    } finally {
      // Clear both storages
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success(i18n.t('auth.logoutSuccess'));
    }
  }, []);

  // Update user profile
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    // Update in the appropriate storage
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const currentUser = JSON.parse(storage.getItem('user') || '{}');
    storage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    if (!state.user?.role) return false;
    if (Array.isArray(state.user.role)) {
      return state.user.role.includes(role);
    }
    return state.user.role === role;
  }, [state.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('Admin');
  }, [hasRole]);

  // Check if user is student
  const isStudent = useCallback(() => {
    return hasRole('Student');
  }, [hasRole]);

  // Check if user is instructor
  const isInstructor = useCallback(() => {
    return hasRole('Instructor');
  }, [hasRole]);

  // Check instructor title/degree
  const isTeachingAssistant = useCallback(() => {
    return hasRole('Instructor') && state.user?.instructorTitle === 'TeachingAssistant';
  }, [hasRole, state.user]);

  const isProfessor = useCallback(() => {
    return hasRole('Instructor') && 
      ['Professor', 'AssociateProfessor', 'AssistantProfessor'].includes(state.user?.instructorTitle);
  }, [hasRole, state.user]);

  const isLecturer = useCallback(() => {
    return hasRole('Instructor') && 
      ['Lecturer', 'AssistantLecturer'].includes(state.user?.instructorTitle);
  }, [hasRole, state.user]);

  const getInstructorDegreeLabel = useCallback(() => {
    const titles = {
      'TeachingAssistant': i18n.t('instructorTitles.TeachingAssistant'),
      'AssistantLecturer': i18n.t('instructorTitles.AssistantLecturer'),
      'Lecturer': i18n.t('instructorTitles.Lecturer'),
      'AssistantProfessor': i18n.t('instructorTitles.AssistantProfessor'),
      'AssociateProfessor': i18n.t('instructorTitles.AssociateProfessor'),
      'Professor': i18n.t('instructorTitles.Professor')
    };
    return titles[state.user?.instructorTitle] || state.user?.instructorTitle || i18n.t('instructorTitles.Instructor');
  }, [state.user]);

  // Save current account to saved accounts list
  const saveCurrentAccount = useCallback(() => {
    if (!state.user) return;
    
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) return;
    
    const accountData = {
      id: state.user.id,
      email: state.user.email,
      fullName: state.user.fullName,
      firstName: state.user.firstName,
      lastName: state.user.lastName,
      role: state.user.role,
      instructorTitle: state.user.instructorTitle,
      accessToken,
      refreshToken,
      savedAt: new Date().toISOString(),
    };
    
    // Get existing saved accounts
    let savedAccounts = [...state.savedAccounts];
    
    // Check if account already exists
    const existingIndex = savedAccounts.findIndex(acc => acc.id === state.user.id);
    if (existingIndex !== -1) {
      // Update existing account
      savedAccounts[existingIndex] = accountData;
    } else {
      // Add new account (limit to MAX_SAVED_ACCOUNTS)
      if (savedAccounts.length >= MAX_SAVED_ACCOUNTS) {
        toast.error(i18n.t('auth.maxSavedAccounts', { max: MAX_SAVED_ACCOUNTS }));
        return;
      }
      savedAccounts.push(accountData);
    }
    
    // Save to localStorage
    localStorage.setItem('savedAccounts', JSON.stringify(savedAccounts));
    dispatch({ type: AUTH_ACTIONS.SET_SAVED_ACCOUNTS, payload: savedAccounts });
    toast.success(i18n.t('auth.accountSaved'));
  }, [state.user, state.savedAccounts]);

  // Switch to a saved account
  const switchAccount = useCallback(async (accountId) => {
    const account = state.savedAccounts.find(acc => acc.id === accountId);
    if (!account) {
      toast.error(i18n.t('auth.accountNotFound'));
      return;
    }
    
    // Check if token is expired
    if (isTokenExpired(account.accessToken)) {
      toast.error(i18n.t('auth.sessionExpired'));
      removeAccount(accountId);
      return;
    }
    
    // Save current account before switching (if logged in)
    if (state.user && state.user.id !== accountId) {
      saveCurrentAccount();
    }
    
    // Clear current session
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    // Set new session (use localStorage for saved accounts)
    localStorage.setItem('accessToken', account.accessToken);
    localStorage.setItem('refreshToken', account.refreshToken);
    localStorage.setItem('rememberMe', 'true');
    
    const user = {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      instructorTitle: account.instructorTitle,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
    toast.success(i18n.t('auth.switchedTo', { name: account.fullName || account.email }));
  }, [state.savedAccounts, state.user, saveCurrentAccount]);

  // Remove a saved account
  const removeAccount = useCallback((accountId) => {
    const savedAccounts = state.savedAccounts.filter(acc => acc.id !== accountId);
    localStorage.setItem('savedAccounts', JSON.stringify(savedAccounts));
    dispatch({ type: AUTH_ACTIONS.SET_SAVED_ACCOUNTS, payload: savedAccounts });
    toast.success(i18n.t('auth.accountRemoved'));
  }, [state.savedAccounts]);

  // Get saved accounts (excluding current user)
  const getSavedAccounts = useCallback(() => {
    return state.savedAccounts.filter(acc => acc.id !== state.user?.id);
  }, [state.savedAccounts, state.user]);

  // Clear all saved accounts
  const clearAllSavedAccounts = useCallback(() => {
    localStorage.removeItem('savedAccounts');
    dispatch({ type: AUTH_ACTIONS.SET_SAVED_ACCOUNTS, payload: [] });
    toast.success(i18n.t('auth.accountsCleared'));
  }, []);

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    savedAccounts: state.savedAccounts,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    isAdmin,
    isStudent,
    isInstructor,
    isTeachingAssistant,
    isProfessor,
    isLecturer,
    getInstructorDegreeLabel,
    // Switch user functions
    saveCurrentAccount,
    switchAccount,
    removeAccount,
    getSavedAccounts,
    clearAllSavedAccounts,

    // Dev/demo helpers
    setSessionFromLoginResponse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
