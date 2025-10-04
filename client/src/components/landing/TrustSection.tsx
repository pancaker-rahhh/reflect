import { motion } from 'framer-motion'
import { Shield, Lock, Award, Clock, CheckCircle, Globe } from 'lucide-react'

const trustItems = [
  {
    icon: Shield,
    text: 'Secure',
    description: 'Data protection',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Lock,
    text: 'Privacy First',
    description: 'Your data is safe',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    icon: Award,
    text: 'Reliable',
    description: 'Consistent service',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Clock,
    text: 'Fast Setup',
    description: '3-minute integration',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: CheckCircle,
    text: 'Free Plan',
    description: 'Start with free tier',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Globe,
    text: 'Global',
    description: 'Works everywhere',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
]

const securityFeatures = [
  'Data encryption',
  'Secure hosting',
  'Privacy protection',
  'User authentication',
  'Access controls',
  'Activity logs',
]

export const TrustSection = () => {
  return (
    <motion.section
      className="bg-white py-16 border-t border-gray-200"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure & Reliable Platform</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your data is protected with security measures and best practices.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className={`${item.bgColor} rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center`}
              >
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <div className="text-sm font-medium text-gray-700">{item.text}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Security Features */}
        <motion.div
          className="bg-gray-50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Security Features</h3>
              <ul className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Secure Infrastructure</div>
                    <div className="text-sm text-gray-600">
                      Protected data storage and transmission
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Lock className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Privacy Focused</div>
                    <div className="text-sm text-gray-600">
                      Respects user privacy and data rights
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Reliable Service</div>
                    <div className="text-sm text-gray-600">Consistent uptime and performance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
