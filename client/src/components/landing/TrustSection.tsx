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
      className="bg-background py-20 border-t border-border/50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
            Secure & Reliable Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your data is protected with enterprise-grade security measures and industry best
            practices.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20">
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
                className={`${item.bgColor} rounded-2xl p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg`}
              >
                <item.icon className={`h-10 w-10 ${item.color}`} />
              </div>
              <div className="text-base font-semibold text-foreground">{item.text}</div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Security Features */}
        <motion.div
          className="bg-muted/30 rounded-3xl p-10 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Security Features</h3>
              <ul className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                    <span className="text-foreground text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Platform Features</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-background rounded-2xl shadow-lg">
                  <Shield className="h-8 w-8 text-success" />
                  <div>
                    <div className="font-semibold text-foreground text-lg">
                      Secure Infrastructure
                    </div>
                    <div className="text-base text-muted-foreground">
                      Protected data storage and transmission
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-background rounded-2xl shadow-lg">
                  <Lock className="h-8 w-8 text-info" />
                  <div>
                    <div className="font-semibold text-foreground text-lg">Privacy Focused</div>
                    <div className="text-base text-muted-foreground">
                      Respects user privacy and data rights
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-background rounded-2xl shadow-lg">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground text-lg">Reliable Service</div>
                    <div className="text-base text-muted-foreground">
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
