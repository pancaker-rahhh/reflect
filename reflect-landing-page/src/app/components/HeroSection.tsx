"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Rocket, Star, Sparkles, Zap } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const HeroSection = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const particleArray = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            delay: Math.random() * 2,
        }));
        setParticles(particleArray);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
            mouseX.set(x);
            mouseY.set(y);
        }
    };

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');

        button.appendChild(ripple);
        setTimeout(() => button.removeChild(ripple), 600);
    };

    const backgroundX = useTransform(mouseX, [0, 800], [0, 50]);
    const backgroundY = useTransform(mouseY, [0, 800], [0, 50]);

    return (
        <motion.div 
            ref={containerRef}
            className="relative isolate overflow-hidden h-screen min-h-[700px] flex items-center justify-center text-white cursor-none"
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Dynamic Animated Gradient Background */}
            <motion.div 
                className="absolute inset-0 -z-20 bg-gradient-to-br from-purple-900 via-indigo-900 via-blue-800 to-gray-900 animate-gradient-shift"
                style={{
                    x: backgroundX,
                    y: backgroundY,
                }}
            />
            
            {/* Interactive Particles */}
            <div className="absolute inset-0 -z-15">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute bg-white/20 rounded-full"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            x: [-10, 10, -10],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 4 + particle.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Floating UI Elements with Enhanced Animations */}
            <div className="absolute inset-0 -z-10 opacity-15">
                <motion.div 
                    className="absolute top-[10%] left-[5%] h-32 w-48 rounded-2xl glass-effect"
                    animate={{ 
                        y: [-20, 20, -20],
                        rotate: [0, 5, 0, -5, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute top-[20%] right-[10%] h-24 w-32 rounded-2xl glass-effect"
                    animate={{ 
                        y: [20, -20, 20],
                        rotate: [0, -3, 0, 3, 0],
                        scale: [1, 0.9, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-[15%] left-[20%] h-40 w-56 rounded-2xl glass-effect"
                    animate={{ 
                        y: [-15, 15, -15],
                        rotate: [0, 2, 0, -2, 0],
                        x: [-5, 5, -5]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-[25%] right-[15%] h-28 w-40 rounded-2xl glass-effect"
                    animate={{ 
                        y: [25, -25, 25],
                        rotate: [0, -4, 0, 4, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 -z-5 opacity-10">
                <motion.div
                    className="absolute top-[30%] left-[15%]"
                    animate={{ 
                        y: [-30, 30, -30],
                        rotate: [0, 360],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                >
                    <Star size={24} className="text-white" />
                </motion.div>
                <motion.div
                    className="absolute top-[60%] right-[20%]"
                    animate={{ 
                        y: [30, -30, 30],
                        rotate: [0, -360],
                        scale: [1, 0.8, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity }}
                >
                    <Sparkles size={28} className="text-white" />
                </motion.div>
                <motion.div
                    className="absolute bottom-[40%] left-[10%]"
                    animate={{ 
                        y: [-20, 20, -20],
                        rotate: [0, 180, 360],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                >
                    <Zap size={20} className="text-white" />
                </motion.div>
            </div>

            {/* Custom Cursor */}
            <motion.div
                className="absolute w-6 h-6 bg-white/30 rounded-full pointer-events-none mix-blend-difference z-50"
                animate={{
                    x: mousePosition.x - 12,
                    y: mousePosition.y - 12,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />

            {/* Main Content */}
            <div className="mx-auto max-w-4xl text-center px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h1 
                        className="text-4xl font-bold tracking-tight text-white sm:text-7xl text-shadow"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <motion.span
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="inline-block"
                        >
                            Understand Your Users,
                        </motion.span>
                        <br />
                        <motion.span
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                        >
                            Build Better Products
                        </motion.span>
                    </motion.h1>
                </motion.div>

                <motion.p 
                    className="mt-8 text-xl leading-8 text-white/90 text-shadow"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    Reflect is the easiest way to collect, manage, and analyze user feedback. 
                    Stop guessing what your users want and start making data-driven decisions.
                </motion.p>

                <motion.div 
                    className="mt-12 flex items-center justify-center gap-x-8 flex-wrap gap-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <motion.button
                        onClick={createRipple}
                        className="relative overflow-hidden ripple-container rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 flex items-center gap-3 group"
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Rocket size={20} />
                        </motion.div>
                        Get Started for Free
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.button>

                    <motion.button
                        onClick={() => scrollTo('video-section')}
                        className="text-lg font-semibold leading-6 text-white/90 flex items-center gap-3 group hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="group-hover:scale-125 transition-transform"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <PlayCircle size={24} />
                        </motion.div>
                        See it in action
                    </motion.button>
                </motion.div>

                {/* Stats/Social Proof */}
                <motion.div
                    className="mt-16 flex items-center justify-center gap-8 text-white/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.6 }}
                >
                    <motion.div 
                        className="text-center"
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="text-2xl font-bold text-white">10K+</div>
                        <div className="text-sm">Happy Users</div>
                    </motion.div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <motion.div 
                        className="text-center"
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="text-2xl font-bold text-white">99.9%</div>
                        <div className="text-sm">Uptime</div>
                    </motion.div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <motion.div 
                        className="text-center"
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="text-2xl font-bold text-white">5-Star</div>
                        <div className="text-sm">Rating</div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HeroSection;