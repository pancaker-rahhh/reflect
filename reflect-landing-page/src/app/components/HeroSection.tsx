"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Heart, Lightbulb, Bug, Star, BarChart3, TrendingUp, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface FeedbackParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'heart' | 'star' | 'idea' | 'bug';
  color: string;
  size: number;
  opacity: number;
  life: number;
}

interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'praise' | 'question';
  text: string;
  timestamp: Date;
}

const HeroSection = () => {
  const [particles, setParticles] = useState<FeedbackParticle[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    { id: '1', type: 'praise', text: 'Love the new design!', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', type: 'feature', text: 'Add dark mode please', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    { id: '3', type: 'bug', text: 'Button not working on mobile', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  ]);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedType, setSelectedType] = useState<'bug' | 'feature' | 'praise' | 'question'>('praise');
  const [metrics, setMetrics] = useState({
    totalFeedback: 2847,
    satisfaction: 4.8,
    responseRate: 94,
    activeUsers: 1203
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const particleIdRef = useRef(0);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  }, [mouseX, mouseY]);

  // Particle system
  const createParticle = useCallback((x: number, y: number, type: FeedbackParticle['type']) => {
    const colors = {
      heart: '#ef4444',
      star: '#eab308', 
      idea: '#8b5cf6',
      bug: '#f97316'
    };

    const newParticle: FeedbackParticle = {
      id: `particle-${particleIdRef.current++}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      type,
      color: colors[type],
      size: Math.random() * 20 + 10,
      opacity: 1,
      life: 100
    };

    setParticles(prev => [...prev, newParticle]);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.99,
          vy: particle.vy * 0.99,
          opacity: particle.opacity * 0.98,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0 && particle.opacity > 0.01)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Auto-create ambient particles
  useEffect(() => {
    const interval = setInterval(() => {
      if (particles.length < 15) {
        const types: FeedbackParticle['type'][] = ['heart', 'star', 'idea', 'bug'];
        createParticle(
          Math.random() * 100,
          Math.random() * 100,
          types[Math.floor(Math.random() * types.length)]
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [particles.length, createParticle]);

  // Submit feedback
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type: selectedType,
      text: feedbackText,
      timestamp: new Date()
    };

    setFeedbackItems(prev => [newFeedback, ...prev.slice(0, 4)]);
    
    // Create celebration particles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createParticle(50, 50, selectedType === 'praise' ? 'heart' : selectedType === 'feature' ? 'idea' : selectedType === 'bug' ? 'bug' : 'star');
      }, i * 100);
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalFeedback: prev.totalFeedback + 1,
      satisfaction: selectedType === 'praise' ? Math.min(5, prev.satisfaction + 0.1) : prev.satisfaction
    }));

    setFeedbackText('');
    setIsWidgetOpen(false);
  };

  // Background transforms based on mouse position
  const backgroundX = useTransform(mouseX, [0, 1000], [-20, 20]);
  const backgroundY = useTransform(mouseY, [0, 600], [-10, 10]);

  const typeIcons = {
    bug: <Bug size={16} />,
    feature: <Lightbulb size={16} />,
    praise: <Heart size={16} />,
    question: <MessageCircle size={16} />
  };

  const typeColors = {
    bug: 'from-red-500 to-orange-500',
    feature: 'from-purple-500 to-indigo-500', 
    praise: 'from-pink-500 to-red-500',
    question: 'from-blue-500 to-cyan-500'
  };

  return (
    <motion.div 
      ref={containerRef}
      className="relative isolate overflow-hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Dynamic Background with Glass Morphism */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-purple-800/30 to-indigo-900/50"
        style={{ x: backgroundX, y: backgroundY }}
      />

      {/* Mirror Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      {/* Floating Glass Panels */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-16 w-48 h-24 bg-purple-500/10 backdrop-blur-sm border border-purple-300/20 rounded-2xl"
          animate={{ 
            y: [10, -10, 10],
            rotate: [0, -1, 1, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-20 w-56 h-40 bg-blue-500/10 backdrop-blur-sm border border-blue-300/20 rounded-2xl"
          animate={{ 
            y: [-15, 15, -15],
            rotate: [0, 1, -1, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Feedback Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              color: particle.color,
              fontSize: `${particle.size}px`,
              opacity: particle.opacity
            }}
            animate={{
              scale: [1, 1.15],
              rotate: [0, 360]
            }}
            transition={{
              scale: { 
                duration: 1, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              },
              rotate: { duration: 8, repeat: Infinity, ease: "linear" }
            }}
          >
            {particle.type === 'heart' && <Heart />}
            {particle.type === 'star' && <Star />}
            {particle.type === 'idea' && <Lightbulb />}
            {particle.type === 'bug' && <Bug />}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        {/* Left Column - Brand & CTA */}
        <motion.div 
          className="text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl sm:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span 
              className="inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                background: "linear-gradient(45deg, #ffffff, #a855f7, #ec4899, #ffffff)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Reflect
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/80 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Experience feedback in real-time. Watch your input transform into insights instantly.
          </motion.p>

          <motion.button
            onClick={() => setIsWidgetOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/25"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={20} />
            </motion.div>
            Try it Live Now
          </motion.button>
        </motion.div>

        {/* Center Column - Interactive Widget */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
        >
          {/* Widget Container */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="text-center mb-6"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Live Demo Widget</h3>
              <p className="text-white/70">Leave feedback and watch the magic happen</p>
            </motion.div>

            {/* Widget Button */}
            <motion.button
              onClick={() => setIsWidgetOpen(!isWidgetOpen)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isWidgetOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageCircle size={20} />
              </motion.div>
              {isWidgetOpen ? 'Close Feedback' : 'Leave Feedback'}
            </motion.button>

            {/* Feedback Form */}
            <AnimatePresence>
              {isWidgetOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 space-y-4"
                >
                  {/* Type Selector */}
                  <div className="flex gap-2">
                    {(Object.keys(typeIcons) as Array<keyof typeof typeIcons>).map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedType === type
                            ? `bg-gradient-to-r ${typeColors[type]} text-white`
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {typeIcons[type]}
                        {type}
                      </motion.button>
                    ))}
                  </div>

                  {/* Text Input */}
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />

                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    whileHover={feedbackText.trim() ? { scale: 1.02 } : {}}
                    whileTap={feedbackText.trim() ? { scale: 0.98 } : {}}
                  >
                    <Send size={16} />
                    Submit Feedback
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Column - Live Metrics & Recent Feedback */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Metrics Dashboard */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Live Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white"
                  animate={{ scale: [1, 1.03] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  {metrics.totalFeedback.toLocaleString()}
                </motion.div>
                <div className="text-white/60 text-sm">Total Feedback</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white flex items-center justify-center gap-1"
                  animate={{ scale: [1, 1.03] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  {metrics.satisfaction}
                  <Star size={16} className="text-yellow-400" />
                </motion.div>
                <div className="text-white/60 text-sm">Satisfaction</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white"
                  animate={{ scale: [1, 1.03] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  {metrics.responseRate}%
                </motion.div>
                <div className="text-white/60 text-sm">Response Rate</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white flex items-center justify-center gap-1"
                  animate={{ scale: [1, 1.03] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  {metrics.activeUsers.toLocaleString()}
                  <Users size={16} className="text-blue-400" />
                </motion.div>
                <div className="text-white/60 text-sm">Active Users</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Feedback */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Live Feedback
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {feedbackItems.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${typeColors[item.type]}`}>
                      {typeIcons[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.text}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm flex items-center gap-2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ✨
        </motion.div>
        Move your mouse around and interact with the widget above
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;