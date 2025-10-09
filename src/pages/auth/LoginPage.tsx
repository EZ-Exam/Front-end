import { useState,useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';
import axios from 'axios';
import api from '@/services/axios';
import { useAuth } from '@/pages/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';
declare global {
  interface Window {
    google?: any;
  }
}

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt:', formData);

    // Validate form data
    if (!formData.email || !formData.password) {
      error("Vui lòng điền đầy đủ thông tin", "Thiếu thông tin");
      setIsLoading(false);
      return;
    }
    try {
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      
      console.log('Data being sent to server:', loginData);
      const response = await api.post('/login', loginData);
      console.log('response', response);
      
      if(response.status === 200) {
        // Use AuthContext login method with navigation
        login(response.data.token, navigate);
        
        success(response.data.message || "Đăng nhập thành công!", "Thành công");
      }
    } catch (error:any) {
      console.error('Lỗi đăng nhập:', error);
      error(error.response?.data?.message || "Đăng nhập thất bại", "Lỗi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "310764216947-6bq7kia8mnhhrr9mdckbkt5jaq0f2i2o.apps.googleusercontent.com",
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
          }
        );
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      setIsLoading(true);

      console.log("Google login response:", response);
      console.log("Response credential:", response.credential);
      const requestData = {
        credential: response.credential,
      };

      console.log("Request data being sent:", requestData);

      const loginResponse = await axios.post(
        "http://localhost:5000/api/login/google-login",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000,
        }
      );

      console.log('Backend response:', loginResponse);
      
      if (loginResponse.status === 200) {
        // Use AuthContext login method with navigation
        login(loginResponse.data.token, navigate);
        
        success(loginResponse.data.message || "Đăng nhập Google thành công!", "Thành công");
      }
    } catch (error : any) {
      console.error('Google login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = "Đăng nhập Google thất bại";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra cấu hình Google login.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy endpoint Google login. Vui lòng liên hệ quản trị viên.';
      }
      
      error(errorMessage, "Lỗi Google Login");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full opacity-5 animate-pulse [animation-delay:4s]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        {/* Back button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Về trang chủ</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Enhanced Logo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block group">
              <div className="w-20 h-20 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                <img src={EZEXAMLogo} alt='EZEXAM Logo' className='w-12 h-10 relative z-10 group-hover:scale-110 transition-transform duration-500'/>
              </div>
              <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-2xl animate-spin opacity-60"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Chào mừng trở lại!
            </h1>
            <p className="text-gray-600">
              Đăng nhập để tiếp tục hành trình học tập của bạn
            </p>
          </div>

          {/* Main Login Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Đăng nhập tài khoản
              </CardTitle>
              <CardDescription className="text-gray-600">
                Nhập thông tin để truy cập vào EZEXAM
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-gray-50/50 focus:bg-white"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu của bạn"
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-gray-50/50 focus:bg-white"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                    Quên mật khẩu?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Đăng nhập
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <Separator className="my-6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>
              
              <div id="googleSignInDiv" className="w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    Tiếp tục với Google
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="text-center pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">
                  Đăng ký ngay
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Features highlight */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Bảo mật cao</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">AI-powered</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Nhanh chóng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}