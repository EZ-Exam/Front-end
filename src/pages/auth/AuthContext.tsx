import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/services/axios';

// Định nghĩa kiểu cho token đã decode (cho login flow)
export interface DecodedToken {
  roleId: string;  // role ID từ backend
  sub?: string;   // userId
  name?: string;  // username
  email?: string;
  exp?: number;
  iat?: number;
  phoneNumber?: string;
  avatarUrl?: string;
  [key: string]: any; // fallback cho các field khác
}

// Định nghĩa kiểu cho user data từ API
export interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleId?: string;
  balance?: number | null;
  subscriptionName?: string | null;
  [key: string]: any; // fallback cho các field khác
}

// Kiểu dữ liệu mà context sẽ cung cấp
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  login: (token: string, navigate?: (path: string) => void) => void;
  logout: () => void;
}

// Props cho AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Tạo context với kiểu dữ liệu có thể null ban đầu
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

// Custom hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is authenticated (has valid token)
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    // Kiểm tra token và gọi API my-profile nếu có
    const token = localStorage.getItem('token');
    if (token) {
      // Gọi API my-profile để lấy user data đầy đủ
      fetchUserProfile();
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token: string, navigate?: (path: string) => void) => {
    localStorage.setItem('token', token);
    
    // Gọi API my-profile để lấy user data đầy đủ
    fetchUserProfile(navigate);
  };

  const fetchUserProfile = async (navigate?: (path: string) => void) => {
    try {
      const response = await api.get('/users/my-profile');
      
      if (response.status === 200) {
        const userData = response.data;
        console.log('User profile from API:', userData);
        
        setUser({
          id: userData.id || userData._id || '',
          fullName: userData.fullName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          avatarUrl: userData.avatarUrl || '',
          roleId: userData.roleId || '',
          balance: userData.balance || null,
          subscriptionName: userData.subscriptionName || null,
        });
        
        // Role-based navigation nếu có navigate function
        if (navigate) {
          const roleId = userData.roleId;
          
          setTimeout(() => {
            if (roleId === "1") navigate('/');
            else if (roleId === "2") navigate('/admin');
            else if (roleId === "3") navigate('/mod');
            else navigate('/');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      
      // Fallback navigation
      if (navigate) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    setUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
