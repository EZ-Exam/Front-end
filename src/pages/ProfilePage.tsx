import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  Mail, 
  Calendar, 
  Target, 
  Phone, 
  User, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Award, 
  TrendingUp,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  Sparkles,
  Settings,
  Bell,
  Lock
} from 'lucide-react';
import { mockProgressData } from '@/data/mockData';
import { useAuth } from '@/pages/auth/AuthContext';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import api from '@/services/axios';
import { toast, ToastContainer } from 'react-toastify';
import { uploadImgBBOneFile } from '@/services/imgBB';

export function ProfilePage() {
  const { user, setUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [originalData, setOriginalData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Lấy thông tin user từ API
  const fetchUserData = async () => {
    await withLoading(async () => {
      try {
        setIsLoading(true);
        console.log('Fetching user profile data...');
        
        const response = await api.get('/users/my-profile');
        console.log('User profile response:', response);
        
        if (response.status === 200) {
          const userData = response.data;
          const newFormData = {
            fullName: userData.fullName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            avatarUrl: userData.avatarUrl || '',
          };
          
          setFormData(newFormData);
          setOriginalData(newFormData);
          setUserProfile(userData); // Lưu toàn bộ user data để sử dụng createdAt
          
          // Update AuthContext with fresh data
          setUser({
            id: userData.id || userData._id || '',
            fullName: userData.fullName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            avatarUrl: userData.avatarUrl || '',
            roleId: userData.roleId || '',
          });
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error(error.response?.data?.message || "Failed to load profile data", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
      } finally {
        setIsLoading(false);
      }
    }, "Đang tải thông tin cá nhân...");
  };

  // Load user profile data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, withLoading]); // Include withLoading in dependencies

  const handleSave = async () => {
    await withLoading(async () => {
      try {
        setIsLoading(true);
        console.log('Saving profile:', formData);
    
        // Lấy userId từ user context
        const userId = user?.id;
        if (!userId) {
          toast.error("User ID not found", {
            position: "top-center",
            theme: "light",
            autoClose: 2000
          });
          return;
        }
    
        let avatarUrlToSave = formData.avatarUrl;
    
        // Nếu có ảnh mới được chọn thì upload lên ImgBB
        if (selectedImage) {
          try {
            avatarUrlToSave = await uploadImgBBOneFile(selectedImage);
            console.log("Uploaded ImgBB URL:", avatarUrlToSave);
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            toast.error("Failed to upload image", {
              position: "top-center",
              theme: "light",
              autoClose: 2000
            });
            return;
          }
        }
    
        // Gọi API update profile với URL direct của ImgBB
        const response = await api.put(`/users/${userId}/profile`, {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          avatarUrl: avatarUrlToSave
        });
    
        if (response.status === 200) {
          setOriginalData({ ...formData, avatarUrl: avatarUrlToSave });
          setSelectedImage(null);
          setPreviewImage('');
          setIsEditing(false);
    
          // 👉 Update lại AuthContext để UI (Header, Profile, Avatar) sync theo
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  fullName: formData.fullName,
                  email: formData.email,
                  phoneNumber: formData.phoneNumber,
                  avatarUrl: avatarUrlToSave,
                }
              : null
          );
    
          toast.success("Profile updated successfully", {
            position: "top-center",
            theme: "light",
            autoClose: 2000
          });

          setTimeout(() => {
            window.location.reload();
          }, 2000);

        }
      } catch (error: any) {
        console.error('Error updating profile:', error);
        toast.error(error.response?.data?.message || "Failed to update profile", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
      } finally {
        setIsLoading(false);
      }
    }, "Đang cập nhật thông tin cá nhân...");
  };

  const handleCancel = () => {
    // Khôi phục dữ liệu gốc
    setFormData(originalData);
    setSelectedImage(null);
    setPreviewImage('');
    setIsEditing(false);
    
  };

  // Xử lý chọn ảnh
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB", {
          position: "top-center",
          theme: "light",
          autoClose: 2000
        });
        return;
      }

      setSelectedImage(file);
      
      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  };

  // Format date from API
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <ToastContainer />
        
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Manage your personal information and account settings
          </p>
          
          <div className="flex justify-center gap-4">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                  className="rounded-xl border-2 border-gray-300 hover:border-red-500 hover:text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Show loading skeleton while data is being fetched */}
        {!userProfile ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800">Personal Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-40"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20"></div>
                      <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
                      <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-28"></div>
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-16"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-40"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-28"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-36"></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-8"></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-3 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800">Personal Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Enhanced Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                        <AvatarImage src={previewImage || formData.avatarUrl || ''} />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <button 
                          type="button"
                          className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 shadow-lg"
                          aria-label="Change profile picture"
                          title="Change profile picture"
                          onClick={triggerFileInput}
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-800">{formData.fullName || 'User'}</h3>
                      <p className="text-gray-500 text-lg">Student</p>
                      {selectedImage && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          New image selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </div>

                {/* Hidden file input */}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  title="Upload avatar"
                />

                  {/* Enhanced Form Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        disabled={!isEditing}
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={!isEditing}
                        className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

              </CardContent>
            </Card>
          </div>

            {/* Enhanced Stats & Info */}
            <div className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Member since</p>
                    <p className="font-semibold text-gray-800">
                      {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Unknown'}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Email</p>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-800">{formData.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Phone Number</p>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">{formData.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="p-2 bg-blue-500 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <div className="p-2 bg-green-500 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-gray-600">Tests</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-orange-600">75%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      )}
      </div>
    </div>
  );
}