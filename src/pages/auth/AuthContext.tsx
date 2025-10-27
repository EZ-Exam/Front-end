import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/services/axios';

// Function to decode JWT token
const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};


// Định nghĩa kiểu cho token đã decode (cho login flow)
export interface DecodedToken {
  sub: string;    // email
  jti: string;    // JWT ID
  id: string;     // user ID
  fullname: string; // full name
  email: string;  // email
  roleId: string; // role ID từ backend
  balance: string; // balance as string
  subscriptionTypeId: string; // subscription type ID
  subscriptionCode: string;   // subscription code (PREMIUM, etc.)
  subscriptionName: string;   // subscription name
  subscriptionEndDate: string; // subscription end date
  subscriptionIsActive: string; // subscription active status
  exp: number;    // expiration timestamp
  iss: string;    // issuer
  aud: string;    // audience
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
  balance?: number | string | null;
  subscriptionName?: string | null;
  subscriptionTypeId?: string | null;
  subscriptionCode?: string | null;
  subscriptionEndDate?: string | null;
  subscriptionIsActive?: string | boolean | null;
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
  refreshSubscription?: () => Promise<void>;
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
    // Kiểm tra token và decode để lấy user info
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken) {
        // Sử dụng thông tin từ token để set user
        setUser({
          id: decodedToken.id,
          fullName: decodedToken.fullname,
          email: decodedToken.email,
          roleId: decodedToken.roleId,
          balance: decodedToken.balance,
          subscriptionName: decodedToken.subscriptionName,
          subscriptionTypeId: decodedToken.subscriptionTypeId,
          subscriptionCode: decodedToken.subscriptionCode,
          subscriptionEndDate: decodedToken.subscriptionEndDate,
          subscriptionIsActive: decodedToken.subscriptionIsActive,
        });
        // Sau khi set từ token, đồng bộ subscription hiện tại từ API
        // để đảm bảo trạng thái (BASIC/PREMIUM/...) luôn mới nhất
        void fetchAndMergeSubscription();
      } else {
        // Nếu không decode được token thì xóa token và logout
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Hàm đồng bộ subscription hiện tại từ API vào user state
  const fetchAndMergeSubscription = async () => {
    try {
      const resp = await api.get('/subscription/current');
      if (resp.status === 200 && resp.data) {
        const sub = resp.data;
        setUser(prev => prev ? {
          ...prev,
          subscriptionName: sub.subscriptionName || prev.subscriptionName,
          subscriptionTypeId: (sub.subscriptionTypeId ?? prev.subscriptionTypeId)?.toString?.() || prev.subscriptionTypeId,
          subscriptionCode: sub.subscriptionCode || prev.subscriptionCode,
          subscriptionEndDate: sub.endDate || prev.subscriptionEndDate,
          subscriptionIsActive: sub.isActive ?? prev.subscriptionIsActive,
          // Optionally update balance if API returns it elsewhere
        } : prev);
      }
    } catch (e) {
      // Không chặn app nếu lỗi; giữ nguyên dữ liệu từ token
      console.warn('Could not refresh subscription from API');
    }
  };

  const login = (token: string, navigate?: (path: string) => void) => {
    localStorage.setItem('token', token);
    
    // Decode token để lấy user info
    const decodedToken = decodeJWT(token);
    if (decodedToken) {
      // Sử dụng thông tin từ token để set user
      setUser({
        id: decodedToken.id,
        fullName: decodedToken.fullname,
        email: decodedToken.email,
        roleId: decodedToken.roleId,
        balance: decodedToken.balance,
        subscriptionName: decodedToken.subscriptionName,
        subscriptionTypeId: decodedToken.subscriptionTypeId,
        subscriptionCode: decodedToken.subscriptionCode,
        subscriptionEndDate: decodedToken.subscriptionEndDate,
        subscriptionIsActive: decodedToken.subscriptionIsActive,
      });
      // Đồng bộ subscription từ API ngay sau khi login
      void fetchAndMergeSubscription();
      
      // Role-based navigation nếu có navigate function
      if (navigate) {
        const roleId = decodedToken.roleId;
        
        // Redirect ngay lập tức dựa trên role
        if (roleId === "1") {
          navigate('/dashboard');
        } else if (roleId === "2") {
          navigate('/admin');
        } else if (roleId === "3") {
          navigate('/moderator');
        } else {
          // Fallback cho role không xác định
          navigate('/dashboard');
        }
      }
    } else {
      // Nếu không decode được token thì xóa token và logout
      localStorage.removeItem('token');
      setUser(null);
      
      // Fallback navigation
      if (navigate) {
        navigate('/dashboard');
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
    logout,
    refreshSubscription: fetchAndMergeSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
