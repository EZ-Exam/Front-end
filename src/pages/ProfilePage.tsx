import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Mail, Calendar, GraduationCap, Target } from 'lucide-react';
import { mockUser, mockProgressData } from '@/data/mockData';

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    grade: mockUser.grade.toString(),
    bio: 'Passionate student preparing for university entrance exams.',
    subjects: mockUser.subjects
  });

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

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
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={mockUser.avatar} />
                    <AvatarFallback className="text-lg">{mockUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button 
                      type="button"
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      aria-label="Change profile picture"
                      title="Change profile picture"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{mockUser.name}</h3>
                  <p className="text-gray-500">Grade {mockUser.grade} Student</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className="resize-none"
                />
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
                <p className="font-medium">January 15, 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Grade</p>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium">Grade {mockUser.grade}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {mockUser.subjects.map(subject => (
                    <Badge key={subject} variant="secondary">{subject}</Badge>
                  ))}
                </div>
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
              {mockProgressData.map(subject => (
                <div key={subject.subject}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{subject.subject}</span>
                    <span className="text-sm text-gray-500">{subject.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}