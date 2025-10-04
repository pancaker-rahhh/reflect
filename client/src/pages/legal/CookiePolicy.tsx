import { motion } from 'framer-motion'
import { ArrowLeft, Cookie, Settings, BarChart3, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'

export const CookiePolicy = () => {
  const navigate = useNavigate()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy',
    description: 'Cookie Policy for Reflect - User Feedback Platform',
    url: 'https://reflect.com/cookies',
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
        title="Cookie Policy"
        description="Learn about how Reflect uses cookies and similar technologies to enhance your experience. Understand cookie types, purposes, and how to manage your preferences."
        keywords="cookie policy, cookies, tracking, analytics, user preferences, website cookies, data collection"
        canonicalUrl="https://reflect.com/cookies"
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
            <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
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
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Cookie className="text-orange-600" size={24} />
                  <h3 className="text-lg font-semibold text-orange-900">What Are Cookies?</h3>
                </div>
                <p className="text-orange-800">
                  Cookies are small text files that are stored on your device when you visit our
                  website. They help us provide you with a better experience by remembering your
                  preferences and understanding how you use our service.
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>

              <div className="space-y-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="text-green-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">Essential Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies are necessary for the website to function properly and cannot be
                    disabled.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">What they do:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Keep you logged in to your account</li>
                      <li>• Remember your language preferences</li>
                      <li>• Maintain security and prevent fraud</li>
                      <li>• Enable basic website functionality</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Duration:</strong> Session cookies (deleted when you close your
                      browser) or up to 1 year
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="text-blue-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">Analytics Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies help us understand how visitors interact with our website by
                    collecting and reporting information anonymously.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">What they do:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Track page views and user interactions</li>
                      <li>• Measure website performance</li>
                      <li>• Identify popular features and content</li>
                      <li>• Help us improve user experience</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Duration:</strong> Up to 2 years
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="text-purple-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">Preference Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies remember your choices and preferences to provide you with a
                    personalized experience.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">What they do:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Remember your theme preferences (dark/light mode)</li>
                      <li>• Save your dashboard layout settings</li>
                      <li>• Store your notification preferences</li>
                      <li>• Remember your widget configurations</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Duration:</strong> Up to 1 year
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may also use third-party services that set their own cookies:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <ul className="text-gray-700 space-y-2">
                  <li>
                    <strong>Google Analytics:</strong> Helps us understand website usage and
                    performance
                  </li>
                  <li>
                    <strong>Stripe:</strong> Processes payments securely (if you have a paid plan)
                  </li>
                  <li>
                    <strong>Intercom:</strong> Provides customer support chat functionality
                  </li>
                  <li>
                    <strong>Hotjar:</strong> Helps us understand user behavior through heatmaps and
                    recordings
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Managing Your Cookie Preferences
              </h2>
              <p className="text-gray-700 mb-4">You have several options for managing cookies:</p>

              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Browser Settings</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Most web browsers allow you to control cookies through their settings
                    preferences. You can:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Block all cookies</li>
                    <li>• Block third-party cookies only</li>
                    <li>• Delete existing cookies</li>
                    <li>• Set up notifications when cookies are set</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Our Cookie Settings</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    You can manage your cookie preferences directly in your account settings:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Go to Settings → Privacy & Security</li>
                    <li>• Toggle analytics and preference cookies on/off</li>
                    <li>• Essential cookies cannot be disabled (required for functionality)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Impact of Disabling Cookies
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-yellow-800 mb-2">Please Note:</h4>
                <p className="text-yellow-700 text-sm">
                  Disabling certain cookies may affect the functionality of our website. You may not
                  be able to:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Stay logged in to your account</li>
                  <li>• Save your preferences and settings</li>
                  <li>• Use certain features that require cookies</li>
                  <li>• Receive personalized content and recommendations</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons. We will notify you
                of any material changes by posting the updated policy on our website.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@reflect.com
                  <br />
                  <strong>Subject Line:</strong> Cookie Policy Inquiry
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
