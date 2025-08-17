import React from 'react';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
                    {/* Column 1: Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <MessageSquare className="text-white" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reflect<span className="text-purple-600">.</span></h3>
                        </div>
                        <p className="mt-4 text-gray-600">The simplest way to capture user feedback and build better products.</p>
                        <div className="mt-6 flex items-center space-x-5">
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-gray-600 transition-colors">
                               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.853 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                        <h4 className="font-semibold text-gray-800 uppercase tracking-wider">Product</h4>
                        <ul className="mt-4 space-y-3">
                            <li><a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a></li>
                            <li><a href="#solution" className="text-gray-600 hover:text-purple-600 transition-colors">Solution</a></li>
                            <li><a href="#faq" className="text-gray-600 hover:text-purple-600 transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 className="font-semibold text-gray-800 uppercase tracking-wider">Company</h4>
                        <ul className="mt-4 space-y-3">
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</a></li>
                            <li><a href="/docs" className="text-gray-600 hover:text-purple-600 transition-colors">Docs</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Roadmap</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Affiliates</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h4 className="font-semibold text-gray-800 uppercase tracking-wider">Legal</h4>
                        <ul className="mt-4 space-y-3">
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 5: Alternative To */}
                    <div>
                        <h4 className="font-semibold text-gray-800 uppercase tracking-wider">ALTERNATIVE TO</h4>
                        <ul className="mt-4 space-y-3">
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Featurebase</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Beamer</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Canny</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Upvoty</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Uservoice</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Typeform</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Clickup</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">Feedbask</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-gray-200 pt-8 flex justify-center items-center">
                    <p className="text-gray-500 text-sm text-center">&copy; {new Date().getFullYear()} Reflect Technologies, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
