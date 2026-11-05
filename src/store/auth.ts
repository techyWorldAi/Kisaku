import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginRequest, SignupRequest, AuthResponse } from '../services/api';
import { authAPI } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value;
  });

  // Initialize token from localStorage
  const initializeToken = () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      token.value = storedToken;
    }
  };

  const setAuth = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('authToken', newToken);
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const authResponse = await authAPI.login(credentials);
      
      // Set auth data
      setAuth(authResponse.token, authResponse.user);
      
      return authResponse;
    } catch (error: unknown) {
      clearAuth();
      throw error;
    }
  };

  const signup = async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      const authResponse = await authAPI.signup(userData);
      setAuth(authResponse.token, authResponse.user);
      return authResponse;
    } catch (error: unknown) {
      clearAuth();
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const checkAuth = async (): Promise<boolean> => {
    // Initialize token first
    initializeToken();
    
    if (!token.value) {
      return false;
    }
    
    try {
      const userData = await authAPI.getProfile();
      user.value = userData;
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  const isAdmin = computed(() => user.value?.role === 'admin');
  const isStaff = computed(() => user.value?.role === 'staff');
  const canAccessAdmin = computed(() => isAdmin.value || isStaff.value);
  const isCustomer = computed(() => user.value?.role === 'customer');

  // Initialize when store is created
  initializeToken();

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isStaff,
    canAccessAdmin,
    isCustomer,
    login,
    signup,
    logout,
    checkAuth,
  };
});