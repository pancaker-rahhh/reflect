import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'

export const PrivacyPolicy = () => {
  const navigate = useNavigate()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description: 'Privacy Policy for Reflect - User Feedback Platform',
    url: 'https://reflect.com/privacy',
    mainEntity: {
      '@type': 'Organization',
      name: 'Reflect Technologies, Inc.',
      url: 'https://reflect.com',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'privacy@reflect.com',
        contactType: 'Privacy Department',
      },
    },
  }

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Learn how Reflect protects your privacy and handles your data. Our comprehensive privacy policy covers data collection, usage, and your rights under GDPR and CCPA."
        keywords="privacy policy, data protection, GDPR, CCPA, user privacy, data security, personal information"
        canonicalUrl="https://reflect.com/privacy"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-tertiary border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            className="bg-tertiary rounded-lg shadow-sm border border-border p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="prose prose-lg max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-blue-900">Your Privacy Matters</h3>
                </div>
                <p className="text-blue-800">
                  We are committed to protecting your privacy and ensuring the security of your
                  personal information. This policy explains how we collect, use, and safeguard your
                  data.
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you create an account or use our service, we may collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Name and email address</li>
                <li>Company information (if provided)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information about your use of our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Time and duration of sessions</li>
                <li>Feedback and content you submit</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-purple-600" size={20} />
                    <h4 className="font-medium text-gray-800">Service Delivery</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Provide and maintain our service</li>
                    <li>• Process transactions</li>
                    <li>• Send important updates</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="text-blue-600" size={20} />
                    <h4 className="font-medium text-gray-800">Analytics & Improvement</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Analyze usage patterns</li>
                    <li>• Improve our service</li>
                    <li>• Develop new features</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-green-900">Security Measures</h3>
                </div>
                <ul className="text-green-800 space-y-2">
                  <li>• Encryption in transit and at rest</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and authentication</li>
                  <li>• Secure data centers with physical security</li>
                  <li>• Employee training on data protection</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may
                share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> With trusted third-party services that help us
                  operate our platform (payment processors, hosting providers, analytics services)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  and safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                  sale of assets
                </li>
                <li>
                  <strong>Consent:</strong> When you explicitly consent to sharing
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic functionality
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how you use our service
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings and preferences
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain your personal information only as long as necessary to provide our service
                and fulfill the purposes outlined in this policy. When you delete your account, we
                will delete your personal information within 30 days, except where we are required
                to retain it for legal or regulatory purposes.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 mb-6">
                Your information may be transferred to and processed in countries other than your
                own. We ensure appropriate safeguards are in place to protect your data in
                accordance with this privacy policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our service is not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700 mb-6">
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@reflect.com
                  <br />
                  <strong>Data Protection Officer:</strong> dpo@reflect.com
                  <br />
                  <strong>Address:</strong> Reflect Technologies, Inc.
                  <br />
                  1234 Innovation Drive, Suite 200
                  <br />
                  San Francisco, CA 94105
                  <br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
