import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa kiểu cho token đã decode (tuỳ backend có field gì trong JWT)
export interface DecodedToken {
  roleId: string;  // role ID từ backend
  sub?: string;   // userId
  name?: string;  // username
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: any; // fallback cho các field khác
}

// Kiểu dữ liệu mà context sẽ cung cấp
interface AuthContextType {
  user: DecodedToken | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<DecodedToken | null>>;
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
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        console.log('Decoded token from AuthContext:', decodedToken);
        setUser(decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
