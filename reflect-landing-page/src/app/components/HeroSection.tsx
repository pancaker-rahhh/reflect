"use client";

import React from 'react';
import { PlayCircle, Rocket } from 'lucide-react';

const HeroSection = () => {
    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative isolate overflow-hidden h-screen min-h-[700px] flex items-center justify-center text-white">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-purple-800 via-indigo-800 to-gray-900 animate-gradient-xy" />
            
            {/* Floating UI Elements */}
            <div className="absolute inset-0 -z-10 opacity-20">
                <div className="absolute top-[10%] left-[5%] h-32 w-48 rounded-2xl bg-white/10 backdrop-blur-sm animate-float-1" />
                <div className="absolute top-[20%] right-[10%] h-24 w-32 rounded-2xl bg-white/10 backdrop-blur-sm animate-float-2" />
                <div className="absolute bottom-[15%] left-[20%] h-40 w-56 rounded-2xl bg-white/10 backdrop-blur-sm animate-float-3" />
                <div className="absolute bottom-[25%] right-[15%] h-28 w-40 rounded-2xl bg-white/10 backdrop-blur-sm animate-float-4" />
            </div>

            <div className="mx-auto max-w-3xl text-center px-6">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    Understand Your Users, Build Better Products
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/80">
                    Reflect is the easiest way to collect, manage, and analyze user feedback. Stop guessing what your users want and start making data-driven decisions.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                        href="#"
                        className="rounded-md bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-lg hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        <Rocket size={18} />
                        Get Started for Free
                    </a>
                    <button
                        onClick={() => scrollTo('video-section')}
                        className="text-base font-semibold leading-6 text-white flex items-center gap-2 group"
                    >
                        <PlayCircle className="group-hover:scale-110 transition-transform" size={20} /> See it in action
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;