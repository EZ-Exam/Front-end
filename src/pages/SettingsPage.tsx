import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Eye, 
  Lock,
  Smartphone,
  Mail,
  Volume2,
  Settings,
  Download,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Zap,
  Monitor,
  Moon,
  Sun,
  Languages,
  Clock,
  Key,
  Users,
  Database,
  FileText
} from 'lucide-react';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    twoFactorAuth: false,
    profileVisibility: 'public'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Customize your experience and manage your account preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl p-2">
            <TabsTrigger value="account" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  Account Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Update your account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input id="email" value="alex@example.com" disabled className="h-12 pl-12 rounded-xl border-2 border-gray-200" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input id="phone" placeholder="+1 (555) 123-4567" className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Account Actions
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-12 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                      <Download className="mr-2 h-4 w-4" />
                      Download Data
                    </Button>
                    <Button variant="outline" className="h-12 rounded-xl border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300">
                      <FileText className="mr-2 h-4 w-4" />
                      Export Progress
                    </Button>
                    <Button variant="destructive" className="h-12 rounded-xl border-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="email-notifications" className="text-sm font-semibold text-gray-800">Email Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                        <Label htmlFor="push-notifications" className="text-sm font-semibold text-gray-800">Push Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-600">Receive notifications on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-orange-600" />
                        <Label htmlFor="sound-enabled" className="text-sm font-semibold text-gray-800">Sound Effects</Label>
                      </div>
                      <p className="text-sm text-gray-600">Play sounds for notifications and interactions</p>
                    </div>
                    <Switch
                      id="sound-enabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Email Frequency
                  </h4>
                  <Select defaultValue="daily">
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Palette className="h-6 w-6 text-purple-600" />
                  </div>
                  Display & Language
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Customize your app appearance and language settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {settings.darkMode ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-gray-600" />}
                      <Label htmlFor="dark-mode" className="text-sm font-semibold text-gray-800">Dark Mode</Label>
                    </div>
                    <p className="text-sm text-gray-600">Enable dark theme</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Languages className="h-4 w-4 text-blue-600" />
                      Language
                    </Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="timezone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Time Zone
                    </Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="CET">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  Security & Privacy
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-green-600" />
                      <Label htmlFor="two-factor" className="text-sm font-semibold text-gray-800">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="profile-visibility" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Profile Visibility
                  </Label>
                  <Select 
                    value={settings.profileVisibility} 
                    onValueChange={(value) => updateSetting('profileVisibility', value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    Password & Authentication
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300">
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="h-12 rounded-xl border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}