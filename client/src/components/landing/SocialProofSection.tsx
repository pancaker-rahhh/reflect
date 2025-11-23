import { memo } from 'react'
import { motion } from 'framer-motion'
import { Star, Users, Lightning, TrendUp } from 'phosphor-react'

// TODO: Add real testimonials when you have actual customers
// const testimonials = [
//   {
//     text: "Real customer testimonial here",
//     author: "Real Customer Name",
//     role: "Real Role",
//     company: "Real Company",
//     avatar: "real-avatar-url",
//     rating: 5
//   }
// ]

// TODO: Update with real metrics when you have actual data
const stats = [
  { number: 'Growing', label: 'User Base', icon: Users, color: 'text-info' },
  { number: 'Free', label: 'Plan Available', icon: Star, color: 'text-warning' },
  { number: '3 min', label: 'Setup Time', icon: Lightning, color: 'text-success' },
  { number: 'Easy', label: 'Integration', icon: TrendUp, color: 'text-primary' },
]

export const SocialProofSection = memo(() => {
  return (
    <motion.section
      className="bg-surface-2 py-12 sm:py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} mx-auto mb-3 sm:mb-4`} />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground text-sm sm:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials - Hidden until real testimonials are available */}
        {/* 
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Loved by Product Teams Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of companies using Reflect to collect better feedback and build products users love.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-warning fill-current" />
                ))}
              </div>
              
              <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        */}

        {/* Trust Badges - Hidden until real customers are available */}
        {/* 
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground text-sm mb-6">Trusted by companies worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-muted-foreground">Real Company 1</div>
            <div className="text-2xl font-bold text-muted-foreground">Real Company 2</div>
            <div className="text-2xl font-bold text-muted-foreground">Real Company 3</div>
          </div>
        </motion.div>
        */}
      </div>
    </motion.section>
  )
})
