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
      className="bg-background py-8 sm:py-10 lg:py-12 border-t border-border/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Secure & Reliable Platform
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Your data is protected with enterprise-grade security measures and industry best
            practices.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
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
                className={`${item.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg`}
              >
                <item.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${item.color}`} />
              </div>
              <div className="text-sm sm:text-base font-semibold text-foreground">{item.text}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{item.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Security Features */}
        <motion.div
          className="bg-muted/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Security Features</h3>
              <ul className="space-y-3 sm:space-y-4">
                {securityFeatures.map((feature, index) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-3 sm:gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" />
                    <span className="text-foreground text-base sm:text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Platform Features</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-background rounded-xl sm:rounded-2xl shadow-lg">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground text-base sm:text-lg">
                      Secure Infrastructure
                    </div>
                    <div className="text-sm sm:text-base text-muted-foreground">
                      Protected data storage and transmission
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-background rounded-xl sm:rounded-2xl shadow-lg">
                  <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-info flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground text-base sm:text-lg">Privacy Focused</div>
                    <div className="text-sm sm:text-base text-muted-foreground">
                      Respects user privacy and data rights
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-background rounded-xl sm:rounded-2xl shadow-lg">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground text-base sm:text-lg">Reliable Service</div>
                    <div className="text-sm sm:text-base text-muted-foreground">
                      Consistent uptime and performance
                    </div>
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
