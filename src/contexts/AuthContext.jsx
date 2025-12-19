import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

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
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
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
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
      toast.success('Login successful!');
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      await authApi.register(userData);
      toast.success('Registration successful! Please login.');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
      toast.success('Logged out successfully');
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
      'TeachingAssistant': 'Teaching Assistant',
      'AssistantLecturer': 'Assistant Lecturer',
      'Lecturer': 'Lecturer',
      'AssistantProfessor': 'Assistant Professor',
      'AssociateProfessor': 'Associate Professor',
      'Professor': 'Professor'
    };
    return titles[state.user?.instructorTitle] || state.user?.instructorTitle || 'Instructor';
  }, [state.user]);

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
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
