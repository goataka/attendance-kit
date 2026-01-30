import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage key
const TOKEN_STORAGE_KEY = 'attendance-kit-token';
const USER_ID_STORAGE_KEY = 'attendance-kit-user-id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 初期化時にsessionStorageから認証状態を復元
  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUserId = sessionStorage.getItem(USER_ID_STORAGE_KEY);
    
    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
    }
  }, []);

  const login = async (loginUserId: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(loginUserId, password);
      
      if (result) {
        setIsAuthenticated(true);
        setUserId(loginUserId);
        sessionStorage.setItem(TOKEN_STORAGE_KEY, result.token);
        sessionStorage.setItem(USER_ID_STORAGE_KEY, loginUserId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_ID_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
