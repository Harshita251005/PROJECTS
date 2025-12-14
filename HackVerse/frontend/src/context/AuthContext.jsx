import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        // Ensure id property exists (backend might return _id)
        const userData = {
          ...response.data.user,
          id: response.data.user._id || response.data.user.id,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't logout here - let axios interceptor handle 401s
      // This prevents logout on network errors
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        // Handle case where API returns success: false
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await axios.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });
      if (response.data.success) {
        toast.success('Signup successful! Please check your email to verify your account.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Role checking helpers
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isJudge = user?.role === 'judge';
  const isParticipant = user?.role === 'participant';
  const isMentor = user?.role === 'mentor';

  // Access control helpers
  const canAccessAdminPanel = isAdmin;
  const canAccessOrganizerPanel = isAdmin || isOrganizer;
  const canAccessJudgePanel = isAdmin || isJudge;
  const canCreateEvents = isAdmin || isOrganizer;
  const canManageUsers = isAdmin;

  // Check if user has any of the specified roles
  const hasRole = (...roles) => roles.includes(user?.role);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    // Role flags
    isAdmin,
    isOrganizer,
    isJudge,
    isParticipant,
    isMentor,
    // Access control
    canAccessAdminPanel,
    canAccessOrganizerPanel,
    canAccessJudgePanel,
    canCreateEvents,
    canManageUsers,
    // Helper function
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
