import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Lock, Eye, EyeOff} from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Register attempt:', formData);

    // Validate form data
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        theme: "light",
        autoClose: 2000
      });
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions", {
        position: "top-center",
        theme: "light",
        autoClose: 2000
      });
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
        toast.success(response.data.message || "Registration Successful! Please login to continue.", {
          position: "top-center",
          theme: "light",
          autoClose: 3000
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || "Registration Failed", {
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
        // Store token and update auth state
        login(loginResponse.data.token);
        
        toast.success(loginResponse.data.message || "Registration Successful", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
        
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
      
      let errorMessage = "Google Registration Failed";
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
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Start your exam preparation journey today
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            
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
                  placeholder="Create a password"
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms"
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))}
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <Button type="submit" className="w-full" disabled={!formData.agreeToTerms || isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="my-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-gray-500">Or register with</p>
          </div>
          
          <div id="googleSignInDiv" className="w-full">
            {isLoading ? "Processing..." : "Continue with Google"}
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}