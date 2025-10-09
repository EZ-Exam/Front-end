import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, Shield, Zap, CheckCircle, Star } from 'lucide-react';
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

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    grade: '',
    agreeToTerms: false
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Register attempt:', formData);

    // Validate form data
    if (!formData.name || !formData.email || !formData.password) {
      error("Vui lòng điền đầy đủ thông tin", "Thiếu thông tin");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      error("Vui lòng đồng ý với điều khoản và chính sách", "Chưa đồng ý điều khoản");
      setIsLoading(false);
      return;
    }

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      console.log('Data being sent to server:', registerData);
      const response = await api.post('/signup', registerData);
      console.log('Register response:', response);
      
      if (response.status === 200 || response.status === 201) {
        success(response.data.message || "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.", "Thành công");
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      error(error.response?.data?.message || "Đăng ký thất bại", "Lỗi đăng ký");
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
        // Store token and update auth state
        login(loginResponse.data.token);
        
        success(loginResponse.data.message || "Đăng ký Google thành công", "Thành công");
        
        // Navigate to home page (role-based navigation will be handled by backend API)
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error : any) {
      console.error('Google login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = "Đăng ký Google thất bại";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra cấu hình Google login.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy endpoint Google login. Vui lòng liên hệ quản trị viên.';
      }
      
      error(errorMessage, "Lỗi Google Registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full opacity-5 animate-pulse [animation-delay:4s]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        {/* Back button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors duration-200 group"
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
              <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-t-purple-500 border-r-blue-500 rounded-2xl animate-spin opacity-60"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Tham gia EZEXAM!
            </h1>
            <p className="text-gray-600">
              Tạo tài khoản để bắt đầu hành trình học tập của bạn
            </p>
          </div>

          {/* Main Register Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Tạo tài khoản mới
              </CardTitle>
              <CardDescription className="text-gray-600">
                Điền thông tin để đăng ký tài khoản EZEXAM
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Họ và tên</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập họ và tên của bạn"
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-gray-50/50 focus:bg-white"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-gray-50/50 focus:bg-white"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tạo mật khẩu mạnh"
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-gray-50/50 focus:bg-white"
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
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms"
                    className="mt-1"
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))}
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm font-medium leading-relaxed text-gray-700 cursor-pointer">
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="text-purple-600 hover:text-purple-800 hover:underline transition-colors duration-200">
                        Điều khoản dịch vụ
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="text-purple-600 hover:text-purple-800 hover:underline transition-colors duration-200">
                        Chính sách bảo mật
                      </Link>
                    </label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.agreeToTerms || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Tạo tài khoản
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <Separator className="my-6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Hoặc đăng ký với</span>
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
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors duration-200">
                  Đăng nhập ngay
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Benefits highlight */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Miễn phí</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Chất lượng cao</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Bảo mật</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}