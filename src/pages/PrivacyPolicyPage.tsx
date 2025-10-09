import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';

export function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Privacy Policy</h1>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">EZ EXAM Platform Privacy Policy</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                At EZ EXAM, we are committed to protecting your privacy and ensuring the security of your 
                personal information. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our educational platform.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this 
                Privacy Policy, please do not access the platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 Personal Information</h3>
              <p className="mb-3">We may collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password, grade level</li>
                <li><strong>Profile Information:</strong> Profile picture, bio, educational preferences</li>
                <li><strong>Contact Information:</strong> Phone number, address (if provided)</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 Educational Data</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Test scores and performance analytics</li>
                <li>Study progress and completion rates</li>
                <li>Lesson interactions and time spent</li>
                <li>Mock test results and improvement patterns</li>
                <li>Question bank usage and preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and platform interactions</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and analytics data</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Provision:</strong> To provide and maintain our educational platform</li>
                <li><strong>Account Management:</strong> To create and manage your user account</li>
                <li><strong>Personalization:</strong> To customize your learning experience and recommend relevant content</li>
                <li><strong>Progress Tracking:</strong> To monitor your educational progress and provide analytics</li>
                <li><strong>Communication:</strong> To send you important updates, notifications, and support messages</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform</li>
                <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Service Providers</h3>
              <p className="mb-3">We may share information with trusted third-party service providers who assist us in:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Payment processing</li>
                <li>Email delivery services</li>
                <li>Analytics and data analysis</li>
                <li>Cloud storage and hosting</li>
                <li>Customer support</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Legal Requirements</h3>
              <p className="mb-3">We may disclose your information if required to do so by law or in response to valid legal requests.</p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
              <p className="mb-3">We implement appropriate security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies and Tracking Technologies</h2>
              <p className="mb-3">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Improve user experience and functionality</li>
              </ul>
              <p className="mt-3">
                You can control cookie settings through your browser preferences, but disabling cookies 
                may affect platform functionality.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and 
                fulfill the purposes outlined in this Privacy Policy. When you delete your account, we 
                will delete or anonymize your personal information, except where we are required to retain 
                it for legal or regulatory purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights and Choices</h2>
              <p className="mb-3">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us using the information provided in the Contact section.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p>
                Our platform is designed for educational purposes and may be used by students under 18. 
                We do not knowingly collect personal information from children under 13 without parental 
                consent. If we become aware that we have collected personal information from a child under 
                13 without parental consent, we will take steps to delete such information.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country 
                of residence. We ensure that such transfers comply with applicable data protection laws 
                and implement appropriate safeguards to protect your information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> privacy@ezexam.com</p>
                <p><strong>Phone:</strong> +84 (0) 123 456 789</p>
                <p><strong>Address:</strong> 123 Education Street, Ho Chi Minh City, Vietnam</p>
                <p><strong>Data Protection Officer:</strong> dpo@ezexam.com</p>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Compliance</h2>
              <p>
                This Privacy Policy is designed to comply with applicable data protection laws, including 
                but not limited to the General Data Protection Regulation (GDPR), California Consumer Privacy 
                Act (CCPA), and Vietnamese data protection regulations.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="text-center mt-8">
          <Link to="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
              I Accept Privacy Policy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
