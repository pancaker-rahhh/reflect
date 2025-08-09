"use client";

import React, { useState } from 'react';
import { Bug, BarChart, FileText, Lightbulb, GitMerge, Star, Play, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Bug Reports',
    icon: Bug,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    title: 'Streamline Your Bug Tracking',
    description: 'Track and manage bug reports with detailed information, screenshots, and priority levels. Users can easily report issues with screenshot capture.',
    keyFeatures: ['Screenshot capture', 'Priority classification', 'Status tracking', 'Automatic link where the bug is reported'],
    image: 'https://placehold.co/1200x800/2d3748/ffffff?text=Bug+Reports+UI',
  },
  {
    name: 'Dashboard',
    icon: BarChart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    title: 'Get a Complete Overview',
    description: 'Our comprehensive analytics dashboard gives you real-time insights and performance metrics to track your user engagement and feedback trends.',
    keyFeatures: ['Real-time analytics', 'Performance metrics', 'Customizable widgets', 'Track user engagement'],
    image: 'https://placehold.co/1200x800/4a5568/ffffff?text=Dashboard+UI',
  },
  {
    name: 'Survey',
    icon: FileText,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    title: 'Create Powerful Surveys',
    description: 'Build custom surveys, NPS, and CSAT forms to gather targeted feedback. Understand your users better with flexible and powerful form creation.',
    keyFeatures: ['NPS & CSAT forms', 'Custom form builder', 'Conditional logic', 'In-depth response analysis'],
    image: 'https://placehold.co/1200x800/718096/ffffff?text=Survey+UI',
  },
  {
    name: 'Feature Requests',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    title: 'Prioritize Your Roadmap',
    description: 'Let your users submit ideas and vote on their favorite features. Our voting system helps you build a data-driven roadmap your users will love.',
    keyFeatures: ['Public voting system', 'Feature status updates', 'User comment threads', 'Internal team notes'],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Feature+Requests+UI',
  },
    {
    name: 'Roadmap',
    icon: GitMerge,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    title: 'Share Your Vision',
    description: 'Keep your users in the loop with a beautiful, public-facing roadmap. Show them what you\'re working on and what\'s coming next to build trust and excitement.',
    keyFeatures: ['Public & private roadmaps', 'Drag-and-drop interface', 'User subscriptions for updates', 'Link to feature requests'],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Roadmap+UI',
  },
  {
    name: 'Reviews & Testimonials',
    icon: Star,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    title: 'Showcase Social Proof',
    description: 'Easily collect and display glowing reviews and testimonials from your happiest customers. Build trust and credibility with authentic social proof.',
    keyFeatures: ['Collect text & video testimonials', 'Embeddable review widgets', 'Request reviews from specific users', 'Schema markup for SEO'],
    image: 'https://placehold.co/1200x800/a0aec0/ffffff?text=Reviews+UI',
  },
];

const PlatformSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  };
  
  const activeFeature = features[activeIndex];

  return (
    <motion.div 
      className="bg-white py-24 sm:py-32"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            One platform to handle your <motion.span
              className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
            >
              feedback
            </motion.span>
          </motion.h2>
          <motion.p 
            className="mt-4 text-base leading-7 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Explore our key features through real screenshots of the platform. See how Reflect can streamline your entire feedback lifecycle.
          </motion.p>
        </motion.div>

        <div className="mt-16 overflow-x-auto pb-4">
            <div className="flex justify-center space-x-2 sm:space-x-4">
                {features.map((feature, index) => (
                    <button
                        key={feature.name}
                        onClick={() => setActiveIndex(index)}
                        className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                            activeIndex === index
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 ring-1 ring-inset ring-gray-200'
                        }`}
                    >
                        <feature.icon className={`h-5 w-5 ${activeIndex === index ? 'text-white' : feature.color}`} />
                        {feature.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-4 sm:p-8 shadow-2xl ring-1 ring-gray-900/10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden group">
              <img
                src={activeFeature.image}
                alt={`${activeFeature.name} UI`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
               <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <button className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <Play className="h-10 w-10" fill="currentColor" />
                </button>
              </div>
            </div>
            
            <div>
              <div className={`inline-flex items-center gap-3 rounded-full px-4 py-2 ${activeFeature.bgColor}`}>
                <activeFeature.icon className={`h-6 w-6 ${activeFeature.color}`} />
                <h3 className={`text-base font-bold ${activeFeature.color}`}>{activeFeature.name}</h3>
              </div>
              <h4 className="mt-6 text-xl font-bold tracking-tight text-gray-900">{activeFeature.title}</h4>
              <p className="mt-2 text-base leading-7 text-gray-600">{activeFeature.description}</p>
              <ul className="mt-6 space-y-3">
                {activeFeature.keyFeatures.map((kf) => (
                  <li key={kf} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="h-5 w-5 flex-none text-purple-600" />
                    <span>{kf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronLeft className="h-7 w-7" />
            </button>
            <div className="flex items-center gap-2">
              {features.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    activeIndex === index ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformSection;