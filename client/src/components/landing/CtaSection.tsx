import { CheckCircle, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CtaSection = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <section className="bg-white py-16 sm:py-24">
            <div className="container mx-auto px-6">
                <motion.div 
                    className="relative isolate overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl rounded-3xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <motion.div 
                            className="text-white"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Ready to 10x Your Feedback?
                            </h2>
                            <p className="mt-6 text-lg text-purple-200">
                                Join hundreds of innovative companies who set up in minutes and see immediate results. No credit card required, ever.
                            </p>
                            <ul className="mt-8 space-y-4 text-purple-100">
                                <motion.li 
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Completely Free:</span> Get started without any cost.</span>
                                </motion.li>
                                <motion.li 
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Effortless 3-Min Setup:</span> A single line of code is all it takes.</span>
                                </motion.li>
                                <motion.li 
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <CheckCircle className="text-green-400" size={22} />
                                    <span><span className="font-semibold">Modular by Design:</span> Enable only the features you need.</span>
                                </motion.li>
                            </ul>
                            <motion.button
                                onClick={handleGetStarted}
                                className="mt-10 inline-flex items-center gap-3 rounded-md bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-sm hover:bg-purple-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                viewport={{ once: true }}
                            >
                                Get Started for Free
                                <Rocket size={18} />
                            </motion.button>
                        </motion.div>

                        {/* Visual Representation */}
                        <motion.div 
                            className="hidden lg:block relative w-full h-full"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <motion.div 
                                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">👋</span>
                                        <p className="font-bold text-lg text-gray-800">How can we help?</p>
                                    </div>
                                    <button className="text-gray-500 hover:text-gray-700 transition-colors">&times;</button>
                                </div>
                                
                                {/* Card Content */}
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 text-blue-700">
                                                <span className="text-lg">🐛</span>
                                                <span className="font-medium text-sm">Bug Report</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 text-purple-700">
                                                <span className="text-lg">💡</span>
                                                <span className="font-medium text-sm">Feature Request</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <span className="text-lg">⭐</span>
                                                <span className="font-medium text-sm">Review</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 text-orange-700">
                                                <span className="text-lg">💬</span>
                                                <span className="font-medium text-sm">General</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center text-sm text-gray-600">
                                        Choose a feedback type to get started
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
