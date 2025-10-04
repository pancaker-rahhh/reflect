import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'

export const TermsOfService = () => {
  const navigate = useNavigate()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    description: 'Terms of Service for Reflect - User Feedback Platform',
    url: 'https://reflect.com/terms',
    mainEntity: {
      '@type': 'Organization',
      name: 'Reflect Technologies, Inc.',
      url: 'https://reflect.com',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'legal@reflect.com',
        contactType: 'Legal Department',
      },
    },
  }

  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read our comprehensive Terms of Service for using Reflect, the user feedback platform. Learn about your rights, responsibilities, and our service terms."
        keywords="terms of service, user agreement, legal terms, feedback platform, SaaS terms, service agreement"
        canonicalUrl="https://reflect.com/terms"
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
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>

            {/* Table of Contents */}
            <nav className="mt-6" aria-label="Table of contents">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Table of Contents</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#acceptance"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    1. Acceptance of Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#license"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    2. Service License
                  </a>
                </li>
                <li>
                  <a
                    href="#accounts"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    3. User Accounts
                  </a>
                </li>
                <li>
                  <a
                    href="#content"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    4. Content and Data
                  </a>
                </li>
                <li>
                  <a
                    href="#prohibited"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    5. Prohibited Uses
                  </a>
                </li>
                <li>
                  <a
                    href="#payment"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    6. Payment and Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#availability"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    7. Service Availability
                  </a>
                </li>
                <li>
                  <a
                    href="#termination"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    8. Termination
                  </a>
                </li>
                <li>
                  <a
                    href="#disclaimer"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    9. Disclaimer
                  </a>
                </li>
                <li>
                  <a
                    href="#liability"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    10. Limitation of Liability
                  </a>
                </li>
                <li>
                  <a
                    href="#governing"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    11. Governing Law
                  </a>
                </li>
                <li>
                  <a
                    href="#changes"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    12. Changes to Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    13. Contact Information
                  </a>
                </li>
              </ul>
            </nav>
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
              <h2 id="acceptance" className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-6">
                By accessing and using Reflect ("the Service"), operated by Reflect Technologies,
                Inc. ("we," "us," or "our"), you accept and agree to be bound by these Terms of
                Service ("Terms"). If you disagree with any part of these terms, then you may not
                access the Service.
              </p>

              <h2 id="license" className="text-2xl font-semibold text-gray-900 mb-4">
                2. Service License
              </h2>
              <p className="text-gray-700 mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
                non-transferable license to access and use the Service for your internal business
                purposes. This license does not grant you any rights to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>modify, adapt, or create derivative works of the Service</li>
                <li>reverse engineer, decompile, or disassemble the Service</li>
                <li>remove or alter any proprietary notices or labels</li>
                <li>use the Service for any unlawful purpose or in violation of these Terms</li>
                <li>attempt to gain unauthorized access to any part of the Service</li>
              </ul>

              <h2 id="accounts" className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-700 mb-6">
                When you create an account with us, you must provide information that is accurate,
                complete, and current at all times. You are responsible for safeguarding the
                password and for all activities that occur under your account.
              </p>

              <h2 id="content" className="text-2xl font-semibold text-gray-900 mb-4">
                4. Content and Data
              </h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of all content and data you submit to Reflect. By using our
                service, you grant us a limited license to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>
                  Store, process, and display your content as necessary to provide the service
                </li>
                <li>Create backups and ensure data security</li>
                <li>Analyze usage patterns to improve our service (anonymized data only)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our service:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules,
                  laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual
                  property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or
                  discriminate
                </li>
                <li>To submit false or misleading information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Billing</h2>
              <p className="text-gray-700 mb-4">
                If you choose a paid plan, you agree to pay all fees associated with your
                subscription. Payment terms include:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We may change our pricing with 30 days' notice</li>
                <li>Failure to pay may result in service suspension</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="text-gray-700 mb-6">
                We strive to maintain high service availability but do not guarantee uninterrupted
                access. We may temporarily suspend the service for maintenance, updates, or other
                operational reasons.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-6">
                We may terminate or suspend your account immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach the
                Terms. Upon termination, your right to use the Service will cease immediately.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 mb-6">
                The Service is provided on an "as is" and "as available" basis. To the fullest
                extent permitted by law, we exclude all representations, warranties, conditions, and
                terms relating to our Service and the use of this Service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-6">
                In no event shall Reflect Technologies, Inc., nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without limitation, loss of
                profits, data, use, goodwill, or other intangible losses, resulting from your use of
                the Service.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These Terms shall be interpreted and governed by the laws of the State of Delaware,
                United States, without regard to its conflict of law provisions. Any disputes
                arising from these Terms shall be subject to the exclusive jurisdiction of the
                courts in Delaware.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. If a revision is material, we will try to provide at least 30 days notice
                prior to any new terms taking effect. Your continued use of the Service after any
                such changes constitutes your acceptance of the new Terms.
              </p>

              <h2 id="contact" className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@reflect.com
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
