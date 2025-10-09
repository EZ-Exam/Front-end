import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/register" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Link>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-12 rounded-full flex items-center justify-center">
              <img src={EZEXAMLogo} alt='EZ EXAM Logo' className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Terms of Service</h1>
          </div>
        </div>

        {/* Terms Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">EZ EXAM Platform Terms of Service</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to EZ EXAM, an online educational platform designed to help students prepare for exams 
                through interactive lessons, mock tests, and comprehensive study materials. These Terms of Service 
                ("Terms") govern your use of our platform and services.
              </p>
              <p>
                By accessing or using EZ EXAM, you agree to be bound by these Terms. If you disagree with any 
                part of these terms, you may not access the service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing our platform, or using any of our services, you acknowledge 
                that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when creating your account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use Policy</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>Transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                <li>Impersonate or attempt to impersonate another person or entity</li>
                <li>Interfere with or disrupt the platform or servers connected to the platform</li>
                <li>Attempt to gain unauthorized access to any portion of the platform</li>
                <li>Use any automated system to access the platform for any purpose</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Intellectual Property Rights</h2>
              <p>
                The platform and its original content, features, and functionality are and will remain the 
                exclusive property of EZ EXAM and its licensors. The platform is protected by copyright, 
                trademark, and other laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                publicly perform, republish, download, store, or transmit any of our material without 
                our prior written consent.
              </p>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. User-Generated Content</h2>
              <p>
                You retain ownership of any content you create, upload, or share on our platform. However, 
                by uploading content, you grant us a non-exclusive, royalty-free, worldwide license to use, 
                display, and distribute your content in connection with the platform.
              </p>
              <p>
                You are responsible for ensuring that your content does not violate any third-party rights 
                or applicable laws.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                use of the platform, to understand our practices.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
              <p>
                We strive to provide continuous service availability, but we do not guarantee that the 
                platform will be available at all times. We may experience downtime for maintenance, 
                updates, or technical issues.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the platform will cease immediately.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Disclaimers</h2>
              <p>
                The information on this platform is provided on an "as is" basis. To the fullest extent 
                permitted by law, EZ EXAM excludes all representations, warranties, conditions and terms 
                relating to our platform and the use of this platform.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
              <p>
                In no event shall EZ EXAM, nor its directors, employees, partners, agents, suppliers, 
                or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other 
                intangible losses, resulting from your use of the platform.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of Vietnam, without regard to 
                its conflict of law provisions.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new 
                terms taking effect.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> support@ezexam.com</p>
                <p><strong>Phone:</strong> +84 (0) 123 456 789</p>
                <p><strong>Address:</strong> 123 Education Street, Ho Chi Minh City, Vietnam</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="text-center mt-8">
          <Link to="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
              I Agree to Terms of Service
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
