import { useState,useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';
import axios from 'axios';
import api from '@/services/axios';
import { useAuth } from '@/pages/auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Login attempt:', formData);

    // Validate form data
    if (!formData.email || !formData.password) {
      toast.error("Fill all field,please", {
        position: "top-center",
        theme: "light",
        autoClose: 2000
      });
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
        
        toast.success(response.data.message, {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
      }
    } catch (error:any) {
      console.error('Lỗi đăng nhập:', error);
      toast.error(error.response?.data?.message || "Login Failed", {
        position: "top-center",
        theme: "light",
        autoClose: 2000
      });
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
        // Use AuthContext login method with navigation
        login(loginResponse.data.token, navigate);
        
        toast.success(loginResponse.data.message || "Login Successfully", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
      }
    } catch (error : any) {
      console.error('Google login error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = "Google Login Failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your Google login configuration.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Google login endpoint not found. Please contact administrator.';
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        theme: "light",
        autoClose: 2000
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <ToastContainer />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={EZEXAMLogo} alt='Logo'/>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue your exam preparation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          
          <div className="my-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-gray-500">Or continue with</p>
          </div>
          
          <div id="googleSignInDiv" className="w-auto">
            {isLoading ? "Processing..." : "Continue with Google"}
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}