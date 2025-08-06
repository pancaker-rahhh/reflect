"use client";

import React from 'react';
import { Play } from 'lucide-react';

const VideoSection = () => {
  return (
    <div className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            See Reflect in Action
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Watch a quick walkthrough to see just how easy it is to collect, manage, and act on user feedback.
          </p>
        </div>
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="relative aspect-video w-full rounded-2xl shadow-2xl overflow-hidden group ring-4 ring-purple-500/20">
            <img
              src="https://placehold.co/1920x1080/1a202c/9f7aea?text=Reflect+Demo"
              alt="Video placeholder"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 animate-pulse group-hover:animate-none">
                <Play className="h-12 w-12" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;