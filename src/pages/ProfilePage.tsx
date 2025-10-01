import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Mail, Calendar, Target, Phone } from 'lucide-react';
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
    <div className="space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Show loading skeleton while data is being fetched */}
      {!userProfile ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-gray-300">
                      <AvatarImage src={previewImage || formData.avatarUrl || ''} />
                      <AvatarFallback className="text-lg">
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button 
                        type="button"
                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        aria-label="Change profile picture"
                        title="Change profile picture"
                        onClick={triggerFileInput}
                      >
                        <Camera className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{formData.fullName || 'User'}</h3>
                    <p className="text-gray-500">Student</p>
                    {selectedImage && (
                      <p className="text-sm text-green-600 mt-1">
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

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium">
                    {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">{formData.email || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">{formData.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}