"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Menu } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Features', href: '#features', targetId: 'features' },
    { name: 'Modules', href: '#interactive-modules', targetId: 'interactive-modules' },
    { name: 'Pricing', href: '#pricing', targetId: 'pricing' },
    { name: 'FAQ', href: '#faq', targetId: 'faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className={`p-2 rounded-lg transition-colors ${isScrolled ? 'bg-purple-600' : 'bg-white/20'}`}>
                <MessageSquare className={`transition-colors ${isScrolled ? 'text-white' : 'text-white'}`} size={20} />
            </div>
            <h3 className={`text-xl font-bold transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>Reflect.</h3>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.targetId)} className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <a href="#" className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>
              Log in
            </a>
            <a href="#" className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600">
              Get Started
            </a>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isScrolled ? 'text-gray-800' : 'text-white'}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden ${isScrolled ? 'bg-white/95' : 'bg-black/20'}`}>
        <div className="px-6 pt-2 pb-6 space-y-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.targetId)} className={`block text-base font-semibold transition-colors ${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>
              {link.name}
            </a>
          ))}
          <div className="border-t border-gray-500/20 pt-4 flex flex-col space-y-4">
             <a href="#" className={`text-base font-semibold transition-colors ${isScrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>
              Log in
            </a>
            <a href="#" className="rounded-md bg-purple-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-purple-500 text-center">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;