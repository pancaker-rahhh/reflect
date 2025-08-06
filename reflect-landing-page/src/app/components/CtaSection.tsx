import React from 'react';
import { CheckCircle, Rocket, Star, MessageCircle as MessageIcon, Bug, Lightbulb } from 'lucide-react';

const CtaSection = () => {
    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-6">
                <div className="relative isolate overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl rounded-3xl">
                    <div className="p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className="text-white">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Ready to 10x Your Feedback?
                            </h2>
                            <p className="mt-6 text-lg text-purple-200">
                                Join hundreds of innovative companies who set up in minutes and see immediate results. No credit card required, ever.
                            </p>
                            <ul className="mt-8 space-y-4 text-purple-100">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Completely Free:</span> Get started without any cost.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Effortless 3-Min Setup:</span> A single line of code is all it takes.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Modular by Design:</span> Enable only the features you need.</span>
                                </li>
                            </ul>
                            <a
                                href="#"
                                className="mt-10 inline-flex items-center gap-3 rounded-md bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-sm hover:bg-purple-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
                            >
                                Get Started for Free
                                <Rocket size={18} />
                            </a>
                        </div>

                        {/* --- VISUAL REPRESENTATION (UPDATED) --- */}
                        <div className="hidden lg:block relative w-full h-full">
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                                {/* Card Header */}
                                <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">👋</span>
                                        <p className="font-bold text-lg text-gray-800">How can we help?</p>
                                    </div>
                                    <button className="text-gray-500 hover:text-gray-700 transition-colors">&times;</button>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-8">
                                    <div className="space-y-2">
                                        {/* Item 1 */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <Star className="text-yellow-500 mt-1 flex-shrink-0" size={20}/>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Share Feedback</h4>
                                                <p className="text-sm text-gray-600">Help us improve by sharing your thoughts.</p>
                                            </div>
                                        </div>
                                        {/* Item 2 */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <MessageIcon className="text-blue-500 mt-1 flex-shrink-0" size={20}/>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Leave a Review</h4>
                                                <p className="text-sm text-gray-600">Share your experience with our product.</p>
                                            </div>
                                        </div>
                                        {/* Item 3 */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <Bug className="text-red-500 mt-1 flex-shrink-0" size={20}/>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Report a Bug</h4>
                                                <p className="text-sm text-gray-600">Let us know if something isn't working.</p>
                                            </div>
                                        </div>
                                        {/* Item 4 */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                            <Lightbulb className="text-green-500 mt-1 flex-shrink-0" size={20}/>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Suggest a Feature</h4>
                                                <p className="text-sm text-gray-600">Share your ideas for new features.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-6">Powered by <span className="font-bold text-gray-600">Reflect</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
                        <circle cx="512" cy="512" r="512" fill="url(#gradient-purple-cta)" fillOpacity="0.7"></circle>
                        <defs>
                            <radialGradient id="gradient-purple-cta">
                                <stop stopColor="#7775D6"></stop>
                                <stop offset="1" stopColor="#E935C1" stopOpacity="0"></stop>
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;